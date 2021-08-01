import {Injectable} from '@angular/core';
import {UserService} from '@smartstocktz/core-libs';
import {bfast, BFast} from 'bfastjs';
import {StockModel} from '../models/stock.model';
import {StockWorker} from '../workers/stock.worker';
import {ShopModel} from '../models/shop.model';
import {wrap} from 'comlink';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private stockWorker: StockWorker;
  private stockWorkerNative;

  // private changes;

  constructor(private readonly userService: UserService) {
  }

  async startWorker(shop: ShopModel): Promise<any> {
    if (!this.stockWorker) {
      this.stockWorkerNative = new Worker(new URL('../workers/stock.worker', import .meta.url));
      const SW = wrap(this.stockWorkerNative) as unknown as any;
      this.stockWorker = await new SW(shop);
    }
  }

  stopWorker(): void {
    if (this.stockWorkerNative) {
      this.stockWorkerNative.terminate();
      this.stockWorker = undefined;
      this.stockWorkerNative = undefined;
    }
  }

  async exportToExcel(): Promise<any> {
    const activeShop = await this.userService.getCurrentShop();
    const columns = [
      'id',
      'product',
      'category',
      'unit',
      'quantity',
      'retailPrice',
      'wholesalePrice',
      'wholesaleQuantity',
      'purchase',
      'expire',
      'supplier'
    ];
    const total = await bfast.database(activeShop.projectId).table('stocks').query().count(true).find<number>();
    const stocks = await bfast.database(activeShop.projectId).table('stocks').query()
      .skip(0)
      .size(total)
      .orderBy('product', 1)
      .find<StockModel[]>({
        returnFields: columns
      });
    let csv = '';
    csv = csv.concat(columns.join(',')).concat(',\n');
    stocks.forEach(stock => {
      columns.forEach(column => {
        csv = csv.concat(stock[column] ? stock[column].toString().replace(new RegExp('[,-]', 'ig'), '') : '').concat(', ');
      });
      csv = csv.concat('\n');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csv;
    const url = encodeURI(csvContent);
    const anchor = document.createElement('a');
    anchor.setAttribute('style', 'display: none');
    anchor.download = activeShop.businessName.concat('-stocks.csv').trim();
    anchor.href = url;
    anchor.click();
    return csv;
  }

  async importStocks(stocks: StockModel[]): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return BFast
      .database(shop.projectId)
      .transaction()
      .create('stocks', stocks)
      .commit();
  }

  async addStock(stock: StockModel, inUpdateMode = false): Promise<StockModel> {
    const shop = await this.userService.getCurrentShop();
    if (inUpdateMode) {
      const stockId = stock._id ? stock._id : stock.id;
      delete stock.id;
      delete stock._id;
      delete stock.updatedAt;
      delete stock.createdAt;
      return BFast.database(shop.projectId).collection('stocks')
        .query()
        .byId(stockId)
        .updateBuilder()
        .doc(stock)
        .update();
    } else {
      return BFast.database(shop.projectId).collection('stocks').save(stock);
    }
  }

  async deleteStock(stock: StockModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.deleteProduct(stock, shop);
  }

  async getProducts(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.getProducts(shop);
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.getProductsRemote(shop);
  }

  async deleteMany(stocksId: string[]): Promise<any> {
    const activeShop = await this.userService.getCurrentShop();
    return BFast.database(activeShop.projectId)
      .transaction()
      .delete('stocks', {
        query: {
          filter: {
            $or: stocksId.map(x => {
              return {
                _id: x
              };
            })
          },
          size: stocksId.length,
          skip: 0
        }
      })
      .commit();
  }

}
