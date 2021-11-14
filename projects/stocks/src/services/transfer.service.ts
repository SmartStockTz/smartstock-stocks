import {Injectable} from '@angular/core';
import {cache, database} from 'bfast';
import {IpfsService, SecurityUtil, StorageService, UserService} from '@smartstocktz/core-libs';
import {TransferModel} from '../models/transfer.model';
import {StockModel} from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})

export class TransferService {
  private COLLECTION = 'transfers';

  constructor(private readonly storage: StorageService,
              private readonly userService: UserService) {
  }

  async countAll(): Promise<number> {
    const activeShop = await this.userService.getCurrentShop();
    return database(activeShop.projectId).collection(this.COLLECTION).query().count(true).find();
  }

  async save(transfer: TransferModel): Promise<TransferModel> {
    const activeShop = await this.userService.getCurrentShop();
    transfer.id = SecurityUtil.generateUUID();
    transfer.createdAt = new Date().toISOString();
    const stockableItems = transfer.items.filter(x => x.product.stockable === true);
    await database(activeShop.projectId).bulk().update(this.COLLECTION, {
      query: {
        id: transfer.id,
        upsert: true,
      },
      update: {
        $set: transfer
      }
    }).update('stocks', stockableItems.map(y => {
      return {
        query: {
          id: y.product.id,
          upsert: true,
        },
        update: {
          $set: {
            [`quantity.${transfer.id}`]: {
              q: -y.quantity,
              s: 'transfer',
              d: new Date().toISOString()
            }
          }
        }
      };
    }))
      //   .update('stocks-tracking', stockableItems.map(y => {
      //   return {
      //     query: {
      //       id: y.product.id,
      //       upsert: true,
      //     },
      //     update: {
      //       $set: {
      //         [`quantity.${transfer.id}`]: {
      //           q: -y.quantity,
      //           s: 'transfer',
      //           d: new Date().toISOString()
      //         }
      //       }
      //     }
      //   };
      // }))
      .commit();
    for (const stockableItem of stockableItems) {
      const stockCache = cache({database: activeShop.projectId, collection: 'stocks'});
      const oSt: StockModel = await stockCache.get(stockableItem.product.id);
      if (oSt && isNaN(Number(oSt.quantity)) && typeof oSt.quantity === 'object') {
        oSt.quantity[transfer.id] = {
          q: -stockableItem.quantity,
          s: 'transfer',
          d: new Date().toISOString()
        };
      }
      if (oSt && isNaN(Number(oSt.quantity)) && typeof oSt.quantity !== 'object') {
        oSt.quantity = {};
        oSt.quantity[transfer.id] = {
          q: -stockableItem.quantity,
          s: 'transfer',
          d: new Date().toISOString()
        };
      }
      if (oSt && !isNaN(Number(oSt.quantity))) {
        oSt.quantity = {};
        oSt.quantity[transfer.id] = {
          q: -stockableItem.quantity,
          s: 'transfer',
          d: new Date().toISOString()
        };
      }
      await stockCache.set(oSt.id, oSt);
    }
    return transfer;
  }

  async fetch(pagination: { size?: number, skip?: number } = {size: 20, skip: 0}): Promise<TransferModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    const cids: string[] = await database(activeShop.projectId)
      .collection(this.COLLECTION)
      .query()
      .cids(true)
      .orderBy('createdAt', 'desc')
      .orderBy('_created_at', 'desc')
      .size(pagination?.size)
      .skip(pagination?.skip)
      .find();
    return await Promise.all(
      cids.map(c => {
        return IpfsService.getDataFromCid(c);
      })
    );
  }
}
