import {Injectable} from '@angular/core';
import {getDaasAddress, SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {cache, database} from 'bfast';
import {StockModel} from '../models/stock.model';
import {StockWorker} from '../workers/stock.worker';
import {ShopModel} from '../models/shop.model';
import {wrap} from 'comlink';
import {sha1} from 'crypto-hash';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private stockWorker: StockWorker;
  private stockWorkerNative;

  constructor(private readonly userService: UserService) {
  }

  async stocksListeningStop(): Promise<void> {
    // const shop = await this.userService.getCurrentShop();
    // database(shop.projectId).syncs('stocks').close();
  }

  async stocksListening(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('stocks').changes();
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

  async stocksFromSyncs(): Promise<StockModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    const v = database(activeShop.projectId).syncs('stocks').changes().values();
    return Array.from(v);
  }

  async exportToExcel(): Promise<any> {
    const activeShop = await this.userService.getCurrentShop();
    await this.startWorker(activeShop);
    const s = await this.stocksFromSyncs();
    const csv = await this.stockWorker.export(s);
    const csvContent = 'data:text/csv;charset=utf-8,' + csv;
    const url = encodeURI(csvContent);
    const anchor = document.createElement('a');
    anchor.setAttribute('style', 'display: none');
    anchor.download = activeShop.businessName.concat('-stocks.csv').trim();
    anchor.href = url;
    anchor.click();
    return csv;
  }

  private async mapStockQuantity(stock: StockModel): Promise<StockModel> {
    const s = JSON.parse(JSON.stringify(stock));
    const q = s.quantity as number;
    s.quantity = {};
    s.quantity[await sha1(JSON.stringify(s))] = {
      q,
      s: 'manual',
      d: new Date().toISOString()
    };
    return s;
  }

  async importStocks(csv: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const st = await this.stockWorker.import(csv);
    for (let s of st) {
      s = await this.mapStockQuantity(s);
      await cache().addSyncs({
        action: 'create',
        payload: s,
        tree: 'stocks',
        projectId: shop.projectId,
        applicationId: shop.applicationId,
        databaseURL: getDaasAddress(shop)
      });
      database(shop.projectId).syncs('stocks').changes().set(s as any);
    }
    return st;
  }

  async addStock(stock: StockModel): Promise<StockModel> {
    stock.id = stock.id ? stock.id : SecurityUtil.generateUUID();
    stock.createdAt = new Date().toISOString();
    stock.updatedAt = new Date().toISOString();
    stock = await this.mapStockQuantity(stock);
    const shop = await this.userService.getCurrentShop();
    await cache().addSyncs({
      action: 'update',
      payload: stock,
      tree: 'stocks',
      projectId: shop.projectId,
      applicationId: shop.applicationId,
      databaseURL: getDaasAddress(shop)
    });
    database(shop.projectId).syncs('stocks').changes().set(stock as any);
    return stock;
    // await this.startWorker(shop);
    // return this.stockWorker.saveProduct(stock, shop);
  }

  async deleteStock(stock: StockModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await cache().addSyncs({
      action: 'delete',
      payload: stock,
      tree: 'stocks',
      projectId: shop.projectId,
      applicationId: shop.applicationId,
      databaseURL: getDaasAddress(shop)
    });
    database(shop.projectId).syncs('stocks').changes().delete(stock.id);
    return {id: stock.id};
    // await this.startWorker(shop);
    // return this.stockWorker.deleteProduct(stock, shop);
  }

  async getProducts(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const products = await this.stocksFromSyncs();
    return this.stockWorker.sort(products);
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const products = await database(shop.projectId).syncs('stocks').upload();
    return this.stockWorker.sort(products);
  }

  async deleteMany(stocksId: string[]): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    // await this.startWorker(activeShop);
    for (const id of stocksId) {
      await cache().addSyncs({
        action: 'delete',
        payload: {id},
        tree: 'stocks',
        projectId: shop.projectId,
        applicationId: shop.applicationId,
        databaseURL: getDaasAddress(shop)
      });
      database(shop.projectId).syncs('stocks').changes().delete(id);
    }
    return this.getProducts();
    // return this.stockWorker.deleteMany(stocksId, activeShop);
  }

  async search(query: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const s = await this.getProducts();
    return this.stockWorker.search(query, s);
  }

  async getProduct(id: string): Promise<StockModel> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).syncs('stocks').changes().get(id);
    // await this.startWorker(shop);
    // return this.stockWorker.getProductLocal(id, shop);
  }
}
