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
    await this.startWorker(activeShop);
    const csv = await this.stockWorker.export(activeShop);
    const csvContent = 'data:text/csv;charset=utf-8,' + csv;
    const url = encodeURI(csvContent);
    const anchor = document.createElement('a');
    anchor.setAttribute('style', 'display: none');
    anchor.download = activeShop.businessName.concat('-stocks.csv').trim();
    anchor.href = url;
    anchor.click();
    return csv;
  }

  async importStocks(csv: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.import(csv, shop);
  }

  async addStock(stock: StockModel): Promise<StockModel> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.saveProduct(stock, shop);
    // if (inUpdateMode) {
    //   const stockId = stock._id ? stock._id : stock.id;
    //   delete stock.id;
    //   delete stock._id;
    //   delete stock.updatedAt;
    //   delete stock.createdAt;
    //   return BFast.database(shop.projectId).collection('stocks')
    //     .query()
    //     .byId(stockId)
    //     .updateBuilder()
    //     .doc(stock)
    //     .update();
    // } else {
    //   return BFast.database(shop.projectId).collection('stocks').save(stock);
    // }
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
    await this.startWorker(activeShop);
    return this.stockWorker.deleteMany(stocksId, activeShop);
  }

  async search(query: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.search(query, shop);
  }

  async getProduct(id: string): Promise<StockModel> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.stockWorker.getProductLocal(id, shop);
  }
}
