import {Injectable} from '@angular/core';
import {database} from 'bfast';
import {IpfsService, StorageService, UserService} from '@smartstocktz/core-libs';
import {TransferModel} from '../models/transfer.model';

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
    return database(activeShop.projectId)
      .collection(this.COLLECTION)
      .query()
      .count(true)
      .find();
  }

  async save(transfer: TransferModel): Promise<TransferModel> {
    const activeShop = await this.userService.getCurrentShop();
    return database(activeShop.projectId)
      .bulk()
      .create(this.COLLECTION, transfer)
      .update('stocks', transfer.items
        .filter(x => x.product.stockable === true)
        .map(y => {
          return {
            query: {
              id: y.product.id
            },
            update: {
              $inc: {
                quantity: -y.quantity
              }
            }
          };
        }))
      .commit();
    // .collection(this.COLLECTION)
    // .save<TransferModel>(transfer);
  }

  async fetch(pagination: { size?: number, skip?: number } = {size: 20, skip: 0}): Promise<TransferModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    const cids: string[] = await database(activeShop.projectId)
      .collection(this.COLLECTION)
      .query()
      .cids(true)
      // .orderBy('_created_at', -1)
      .size(pagination?.size)
      .skip(pagination?.skip)
      .find();
    return await Promise.all(
      cids.map(c => {
        return IpfsService.getDataFromCid(c);
      })
    );
  }

  // async searchByDate(date: string): Promise<TransferModel[]> {
  //   const activeShop = await this.userService.getCurrentShop();
  //   return database(activeShop.projectId)
  //     .collection(this.COLLECTION)
  //     .query()
  //     .searchByRegex('date', date)
  //     .find();
  // }
}
