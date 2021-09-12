import {Injectable} from '@angular/core';
import {IpfsService, UserService} from '@smartstocktz/core-libs';
import {database} from 'bfast';
import {StockModel} from '../models/stock.model';
import {StockWorker} from '../workers/stock.worker';
import {ShopModel} from '../models/shop.model';
import {wrap} from 'comlink';
import * as bfast from 'bfast';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private stockWorker: StockWorker;
  private stockWorkerNative;
  private changes;

  constructor(private readonly userService: UserService) {
  }

  stocksListeningStop(): void {
    if (this.changes) {
      this.changes.close();
      this.changes = undefined;
    }
  }

  async stocksListening(): Promise<void> {
    if (this.changes) {
      return;
    }
    const shop = await this.userService.getCurrentShop();
    this.changes = database(shop.projectId)
      .table('stocks')
      .query()
      .changes(() => {
        console.log('stocks changes connected');
        // if (this.remoteAllProductsRunning === true) {
        //   console.log('another remote fetch is running');
        //   return;
        // }
        // this.getProductsRemote().catch(console.log);
      }, () => {
        console.log('stocks changes disconnected');
      });
    this.changes.addListener(async response => {
      if (response && response.body && response.body.change) {
        // console.log(response.body.change);
        if (response.body.change.name === 'create') {
          this.stockWorker.setProductLocal(response.body.change.snapshot, shop).catch(console.log);
        } else if (response.body.change.name === 'update') {
          this.stockWorker.setProductLocal(response.body.change.snapshot, shop).catch(console.log);
        } else if (response.body.change.name === 'delete') {
          await this.stockWorker.removeProductLocal(response.body.change.snapshot, shop);
        } else {
        }
      }
    });
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

  private async remoteAllProducts(shop: ShopModel): Promise<StockModel[]> {
    // this.remoteAllProductsRunning = true;
    const cids = await bfast.database(shop.projectId)
      .collection('stocks')
      .getAll<string>({
        cids: true
      }).finally(() => {
        // this.remoteAllProductsRunning = false;
      });
    return await Promise.all(
      cids.map(c => {
        return IpfsService.getDataFromCid(c);
      })
    ) as any[];
  }

  async getProductsRemote(): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const products = await this.remoteAllProducts(shop);
    return this.stockWorker.getProductsRemote(shop, products);
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
