import {Injectable} from '@angular/core';
import {SecurityUtil, UserService} from 'smartstock-core';
import {cache, database, functions} from 'bfast';
import {StockModel} from '../models/stock.model';
import {StockWorker} from '../workers/stock.worker';
import {wrap} from 'comlink';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private readonly userService: UserService) {
  }

  private static async withWorker(
    fn: (stockWorker: StockWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL('../workers/stock.worker', import .meta.url)
      );
      const SW = (wrap(nativeWorker) as unknown) as any;
      const stWorker = await new SW();
      return await fn(stWorker);
    } finally {
      if (nativeWorker) {
        nativeWorker.terminate();
      }
    }
  }

  async stocksListeningStop(): Promise<void> {
  }

  async stocksListening(): Promise<void> {
  }

  async stocksFromLocal(): Promise<StockModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    return cache({database: activeShop.projectId, collection: 'stocks'})
      .getAll()
      .then((stocks) => {
        if (Array.isArray(stocks) && stocks.length === 0) {
          return this.getProductsRemote();
        }
        if (Array.isArray(stocks) && stocks.length > 0) {
          return stocks;
        }
      });
  }

  async exportToExcel(): Promise<any> {
    const activeShop = await this.userService.getCurrentShop();
    const s = await this.stocksFromLocal();
    const csv = await StockService.withWorker((stockWorker) => {
      return stockWorker.export(s);
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

  private mapStockQuantityFromNumberToObject(stock: StockModel): StockModel {
    const s = JSON.parse(JSON.stringify(stock));
    const q = s.quantity as number;
    s.quantity = {};
    s.quantity[SecurityUtil.generateUUID()] = {
      q,
      s: 'manual',
      d: new Date().toISOString()
    };
    return s;
  }

  async importStocks(csv: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    let st = await StockService.withWorker((stockWorker) => {
      return stockWorker.prepareStockForImportFromCsv(csv);
    });
    st = st.map((x) => this.mapStockQuantityFromNumberToObject(x));
    await database(shop.projectId).table('stocks').save(st);
    await cache({database: shop.projectId, collection: 'stocks'}).setBulk(
      st.map((z) => z.id),
      st
    );
    return st;
  }

  async addStock(stock: StockModel): Promise<StockModel> {
    stock.id = stock.product.toLowerCase().replace(new RegExp('\\s+', 'ig'), '_');
    stock.createdAt = new Date().toISOString();
    stock.updatedAt = new Date().toISOString();
    stock.wholesaleQuantity = stock.wholesaleQuantity ? stock.wholesaleQuantity : 1;
    stock.images = Array.isArray(stock.images) ? stock.images : [];
    stock.image = Array.isArray(stock.image) ? stock.image : [];
    stock.expire = stock.expire ? new Date(stock.expire).toISOString() : null;
    if (typeof stock.expire !== 'string') { delete stock.expire; }
    if (stock.barcode.toString().trim() === '') { delete stock.barcode; }
    const shop = await this.userService.getCurrentShop();
    await functions(shop.projectId).request(
      `${this.getBaseShopUrl(shop)}/stock/products`
    ).put(stock);
    cache({database: shop.projectId, collection: 'stocks'})
      .set(stock.id, stock)
      .catch(console.log);
    return stock;
  }

  private getBaseShopUrl(shop): string {
    return `https://smartstock-faas.bfast.fahamutech.com/shop/${shop.projectId}/${shop.applicationId}`;
  }

  async deleteStock(stock: StockModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await functions(shop.projectId).request(`${this.getBaseShopUrl(shop)}/stock/products/${stock.id}`).delete();
    cache({database: shop.projectId, collection: 'stocks'})
      .remove(stock.id)
      .catch(console.log);
    return {id: stock.id};
  }

  async getProducts(): Promise<StockModel[]> {
    const products = await this.stocksFromLocal();
    return StockService.withWorker(async (stockWorker) => {
      return stockWorker.sort(products);
    });
  }

  async getProductsRemote(hard = true): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    const stockCache = cache({
      database: shop.projectId,
      collection: 'stocks'
    });
    let hashes = [];
    if (hard === false) {
      const st = await stockCache.getAll();
      hashes = await StockService.withWorker(async (stockWorker) => {
        return await stockWorker.localStocksHashes(st);
      });
    }
    const url = `${this.getBaseShopUrl(shop)}/stock/products`;
    return functions(shop.projectId)
      .request(url)
      .post(hashes)
      .then(async (stocks: StockModel[]) => {
        // console.log(stocks);
        if (hard === true) {
          await cache({
            database: shop.projectId,
            collection: 'stocks'
          }).clearAll();
        }
        await stockCache.setBulk(
          stocks.map((s) => s.id),
          stocks
        );
        const stok = await stockCache.getAll();
        return StockService.withWorker(async (stockWorker) =>
          stockWorker.sort(stok)
        );
      });
  }

  async maybeRefreshStocks(): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const stockCache = cache({
      database: shop.projectId,
      collection: 'stocks'
    });
    const stocks = await stockCache.getAll();
    const a = await StockService.withWorker(async (stockWorker) => {
      return await stockWorker.hasProductsChanges(shop, stocks);
    });
    if (a && a.a === 1) {
      await this.getProductsRemote(false);
    }
  }

  async search(query: string): Promise<any> {
    const s = await this.getProducts();
    return StockService.withWorker((stockWorker) =>
      stockWorker.search(query, s)
    );
  }

  async getProduct(id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return cache({database: shop.projectId, collection: 'stocks'})
      .get(id)
      .then((stock) => {
        if (stock) {
          return stock;
        }
        return database(shop.projectId).table('stocks').get(id);
      });
  }

  async positiveStockValue(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockValue(shop);
    });
  }

  async positiveStockItems(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockItems(shop);
    });
  }

  async positiveStockRetail(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockRetail(shop);
    });
  }

  async positiveStockWhole(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockWhole(shop);
    });
  }


  async getProductQuantityObject(stockId): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId)
      .table('stocks')
      .get(stockId, {
        returnFields: ['quantity']
      });
  }
}
