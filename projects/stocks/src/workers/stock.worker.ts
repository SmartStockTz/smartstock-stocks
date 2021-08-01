import {expose} from 'comlink';
import {bfast} from 'bfastjs';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';
import {sha256} from 'crypto-hash';
import {StockSyncModel} from '../models/stock-sync.model';

function init(shop: ShopModel): void {
  bfast.init({
    applicationId: 'smartstock_lb',
    projectId: 'smartstock'
  });
  bfast.init({
    applicationId: shop.applicationId,
    projectId: shop.projectId,
    adapters: {
      auth: 'DEFAULT'
    }
  }, shop.projectId);
}

export class StockWorker {

  private syncInterval;
  remoteAllProductsRunning = false;

  constructor(shop: ShopModel) {
    init(shop);
    this.syncStocks(shop);
  }

  async productsLocalHashMap(products: StockModel[]): Promise<{ [key: string]: any }> {
    const hashesMap = {};
    if (Array.isArray(products)) {
      for (const localC of products) {
        hashesMap[await sha256(JSON.stringify(localC))] = localC;
      }
    }
    return hashesMap;
  }

  async getProductsLocal(shop: ShopModel): Promise<StockModel[]> {
    return bfast.cache({database: 'stocks', collection: 'stocks'}, shop.projectId).get('all');
  }

  async removeProductLocal(product: StockModel, shop: ShopModel): Promise<StockModel[]> {
    const stocks = await this.getProductsLocal(shop);
    return this.setProductsLocal(stocks.filter(x => x.id !== product.id), shop);
  }

  async setProductLocal(product: StockModel, shop: ShopModel): Promise<StockModel[]> {
    let stocks = await this.getProductsLocal(shop);
    let update = false;
    stocks = stocks.map(x => {
      if (x.id === product.id) {
        update = true;
        return product;
      } else {
        return x;
      }
    });
    if (update === false) {
      stocks.push(product);
    }
    return this.setProductsLocal(stocks, shop);
  }

  async setProductsLocal(products: StockModel[], shop: ShopModel): Promise<StockModel[]> {
    return bfast.cache({database: 'stocks', collection: 'stocks'}, shop.projectId).set('all', products);
  }

  async setProductLocalSync(productSync: StockSyncModel, shop: ShopModel): Promise<StockSyncModel> {
    if (!productSync?.product?.id) {
      return;
    }
    return bfast.cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      .set(productSync.product.id, productSync);
  }

  async getProductsLocalSync(shop: ShopModel): Promise<StockSyncModel[]> {
    return bfast.cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId).getAll();
  }

  async getProductLocalSync(id: string, shop: ShopModel): Promise<StockSyncModel> {
    return bfast.cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId).get(id);
  }

  async getProductsLocalSyncKeys(shop: ShopModel): Promise<string[]> {
    return bfast.cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId).keys();
  }

  async removeProductLocalSync(id: string, shop: ShopModel): Promise<any> {
    return bfast.cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId).remove(id, true);
  }

  private async remoteAllProducts(shop: ShopModel, hashes: any[] = []): Promise<StockModel[]> {
    this.remoteAllProductsRunning = true;
    return bfast.database(shop.projectId)
      .collection('stocks')
      .getAll<StockModel>({
        hashes
      }).finally(() => {
        this.remoteAllProductsRunning = false;
      });
  }

  private remoteProductsMapping(products: StockModel[], hashesMap): StockModel[] {
    if (Array.isArray(products)) {
      products = products.map(x => {
        if (hashesMap[x.toString()]) {
          return hashesMap[x.toString()];
        } else {
          return x;
        }
      });
    }
    return products;
  }

  stocksListeningStop(shop: ShopModel): void {
  }

  async getProducts(shop: ShopModel): Promise<StockModel[]> {
    return await this.getProductsLocal(shop);
  }

  async saveProduct(product: StockModel[], shop: ShopModel): Promise<any> {

  }

  private syncStocks(shop: ShopModel): void {
    let isRunn = false;
    if (this.syncInterval) {
      // console.log('order sync running');
      return;
    }
    console.log('products sync start');
    this.syncInterval = setInterval(async () => {
      if (isRunn === true) {
        return;
      }
      isRunn = true;
      const stockSyncModels: StockSyncModel[] = await this.getProductsLocalSync(shop);
      // console.log(orders, '*****');
      if (Array.isArray(stockSyncModels) && stockSyncModels.length === 0) {
        isRunn = false;
        clearInterval(this.syncInterval);
        this.syncInterval = undefined;
        console.log('products sync stop');
      } else {
        for (const stockSyncModel of stockSyncModels) {
          try {
            if (stockSyncModel.action === 'upsert') {
              await bfast.database(shop.projectId)
                .table('stocks')
                .query()
                .byId(stockSyncModel.product.id)
                .updateBuilder()
                .doc(stockSyncModel.product)
                .upsert(true)
                .update();
            } else if (stockSyncModel.action === 'delete') {
              await bfast.database(shop.projectId)
                .table('stocks')
                .query()
                .byId(stockSyncModel.product.id)
                .delete();
            }
            // console.log(order);
            await this.removeProductLocalSync(stockSyncModel?.product?.id, shop);
          } catch (e) {
            console.log(e);
          }
        }
        isRunn = false;
      }
    }, 2000);
  }

  async getProductsRemote(shop: ShopModel): Promise<StockModel[]> {
    const localProducts = await this.getProductsLocal(shop);
    const hashesMap = await this.productsLocalHashMap(localProducts);
    let products: StockModel[];
    try {
      products = await this.remoteAllProducts(shop, Object.keys(hashesMap));
      products = this.remoteProductsMapping(products, hashesMap);
    } catch (e) {
      console.log(e);
      products = localProducts;
    }
    await this.setProductsLocal(products, shop);
    return products.filter(x => x.saleable);
  }

  async search(query: string, shop: ShopModel): Promise<StockModel[]> {
    const stocks = await this.getProductsLocal(shop);
    return stocks.filter(x => {
      return x.saleable && x?.product?.toLowerCase().includes(query.toLowerCase());
    });
  }

  async deleteProduct(stock: StockModel, shop: ShopModel): Promise<any> {
    await this.setProductLocalSync({
      product: stock,
      action: 'delete'
    }, shop);
    return this.removeProductLocal(stock, shop);
  }
}

expose(StockWorker);
