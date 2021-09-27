import {expose} from 'comlink';
import * as bfast from 'bfast';
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

  constructor(shop: ShopModel) {
    init(shop);
    this.syncStocks(shop);
  }

  private async productsLocalMap(shop: ShopModel): Promise<{ [key: string]: StockModel }> {
    init(shop);
    const productsSyncMap = await this.productsLocalSyncMap(shop);
    const productsMap: { [key: string]: StockModel } = await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .get('all');
    if (
      productsMap &&
      !Array.isArray(productsMap) &&
      Array.isArray(Object.values(productsMap))
    ) {
      Object.keys(productsMap).forEach(k => {
        if (productsSyncMap[k]?.action === 'delete') {
          delete productsMap[k];
        }
      });
      return productsMap;
    } else {
      return {};
    }
  }

  async getProductLocal(id: string, shop: ShopModel): Promise<StockModel> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    return productsMap[id];
  }

  async getProductsLocal(shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    // const productsSyncMap = await this.productsLocalSyncMap(shop);
    // console.log(ps);
    return Object.values(productsMap);
    // .filter(x => {
    //   return (!productsSyncMap[x.id] || productsSyncMap[x.id].action !== 'delete');
    // });
  }

  async removeProductLocal(product: StockModel, shop: ShopModel): Promise<string> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    delete productsMap[product.id];
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return product.id;
  }

  async removeProductsLocal(products: StockModel[], shop: ShopModel): Promise<string[]> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    products.forEach(x => {
      delete productsMap[x.id];
    });
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return products.map(x => x.id);
  }

  async setProductLocal(product: StockModel, shop: ShopModel): Promise<StockModel> {
    init(shop);
    const productsMap = await this.productsLocalMap(shop);
    productsMap[product.id] = product;
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return product;
  }

  async setProductsLocal(products: StockModel[], shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    let productsMap = await this.productsLocalMap(shop);
    productsMap = products.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, productsMap);
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return products;
  }

  async setProductsLocalFromRemote(products: StockModel[], shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const productsSyncMap = await this.productsLocalSyncMap(shop);
    Object.keys(productsSyncMap).forEach(k => {
      if (productsSyncMap[k].action === 'upsert') {
        products.push(productsSyncMap[k].product);
      }
    });
    const productsMap = products.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, {});
    await bfast
      .cache({database: 'stocks', collection: 'stocks'}, shop.projectId)
      .set('all', productsMap);
    return products;
  }

  // ******local sync cache********* //

  private async productsLocalSyncMap(shop: ShopModel): Promise<{ [key: string]: StockSyncModel }> {
    init(shop);
    const productsMap: { [key: string]: StockSyncModel } = await bfast
      .cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      .get('all');
    if (
      productsMap &&
      !Array.isArray(productsMap) &&
      Array.isArray(Object.values(productsMap))
    ) {
      return productsMap;
    } else {
      return {};
    }
  }

  async setProductsLocalSync(productsLocalSync: StockSyncModel[], shop: ShopModel): Promise<StockSyncModel[]> {
    init(shop);
    let productsMap = await this.productsLocalSyncMap(shop);
    const stocks: StockModel[] = [];
    productsMap = productsLocalSync.reduce((a, b) => {
      if (b.action === 'upsert') {
        stocks.push(b.product);
      } else {
        a[b.product.id] = b;
      }
      return a;
    }, productsMap);
    await bfast
      .cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      .set('all', productsMap);
    if (stocks.length > 0) {
      await bfast.database(shop.projectId)
        .bulk()
        .update('stocks', stocks.map(x => {
          return {
            query: {
              id: x.id,
              upsert: true
            },
            update: {
              $set: x
            }
          };
        }))
        .commit();
    }
    return productsLocalSync;
  }

  async setProductLocalSync(productSync: StockSyncModel, shop: ShopModel): Promise<StockSyncModel> {
    init(shop);
    if (productSync.action === 'upsert') {
      await bfast.database(shop.projectId).table('stocks')
        .query()
        .byId(productSync.product.id)
        .updateBuilder()
        .upsert(true)
        .doc(productSync.product)
        .update();
    }
    if (productSync.action === 'delete') {
      await bfast.database(shop.projectId)
        .table('stocks')
        .query()
        .byId(productSync.product.id)
        .delete();
      // const productsMap = await this.productsLocalSyncMap(shop);
      // productsMap[productSync.product.id] = productSync;
      // await bfast
      //   .cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      //   .set('all', productsMap);
    }
    return productSync;
  }

  async getProductsLocalSync(shop: ShopModel): Promise<StockSyncModel[]> {
    init(shop);
    const productsMap = await this.productsLocalSyncMap(shop);
    return Object.values(productsMap);
  }

  async removeProductLocalSync(id: string, shop: ShopModel): Promise<string> {
    init(shop);
    const productsMap = await this.productsLocalSyncMap(shop);
    delete productsMap[id];
    await bfast
      .cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      .set('all', productsMap);
    return id;
  }

  async removeProductsLocalSync(ids: string[], shop: ShopModel): Promise<string[]> {
    init(shop);
    const productsMap = await this.productsLocalSyncMap(shop);
    ids.forEach(id => {
      delete productsMap[id];
    });
    await bfast
      .cache({database: 'stocks', collection: 'stocks_sync'}, shop.projectId)
      .set('all', productsMap);
    return ids;
  }

  // ******local sync cache********* //

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

  async getProducts(shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const products = await this.getProductsLocal(shop);
    if (Array.isArray(products) && products.length > 0) {
      return products;
    } else {
      return [];
    }
  }

  async saveProduct(product: StockModel, shop: ShopModel): Promise<any> {
    init(shop);
    product = await this.sanitizeProduct(product);
    await this.setProductLocalSync({
      product,
      action: 'upsert'
    }, shop);
    await this.setProductLocal(product, shop);
    this.syncStocks(shop);
    return product;
  }

  private syncStocks(shop: ShopModel): void {
    // init(shop);
    // let isRunn = false;
    // if (this.syncInterval) {
    //   // console.log('order sync running');
    //   return;
    // }
    // console.log('products sync start');
    // this.syncInterval = setInterval(async () => {
    //   if (isRunn === true) {
    //     return;
    //   }
    //   isRunn = true;
    //   const stockSyncModels: StockSyncModel[] = await this.getProductsLocalSync(shop);
    //   if (Array.isArray(stockSyncModels) && stockSyncModels.length === 0) {
    //     isRunn = false;
    //     clearInterval(this.syncInterval);
    //     this.syncInterval = undefined;
    //     console.log('products sync stop');
    //   } else {
    //     const upserts = stockSyncModels.filter(x => x.action === 'upsert');
    //     // if (upserts.length > 50) {
    //     //   upserts = upserts.slice(0, 50);
    //     // }
    //     const deletes = stockSyncModels.filter(x => x.action === 'delete');
    //     // if (deletes.length > 1000) {
    //     //   deletes = deletes.slice(0, 1000);
    //     // }
    //     try {
    //       if (upserts?.length > 0) {
    //         const daasUrl = `https://${shop.projectId}-daas.bfast.fahamutech.com/v2`;
    //         const r: any = await bfast.functions(shop.projectId)
    //           .request(daasUrl)
    //           .post({
    //             applicationId: shop.applicationId,
    //             updatestocks: upserts.map(u => {
    //               return {
    //                 id: u.product.id,
    //                 update: {
    //                   $set: u.product
    //                 },
    //                 upsert: true,
    //                 return: ['id']
    //               };
    //             })
    //           });
    //         if (r && r.updatestocks) {
    //           // console.log(r.updatestocks);
    //         } else {
    //           throw r;
    //         }
    //         // await bfast.database(shop.projectId)
    //         //   .table('stocks')
    //         //   .save(upserts.map(x => x.product));
    //         await this.removeProductsLocalSync(upserts.map(k => k.product.id), shop);
    //       }
    //       if (deletes?.length > 0) {
    //         await bfast.database(shop.projectId)
    //           .table('stocks')
    //           .query()
    //           .size(deletes.length)
    //           .skip(0)
    //           .includesIn('id', deletes.map(d => d.product.id))
    //           .delete();
    //         await this.removeProductsLocalSync(deletes.map(d => d.product.id), shop);
    //       }
    //     } catch (e) {
    //       console.log(e);
    //     }
    //     isRunn = false;
    //   }
    // }, 2000);
  }

  private sanitizeField(value: string): any {
    value = value.replace(new RegExp('[-,]', 'ig'), '').trim();
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    if (value.trim().startsWith('[', 0)) {
      return JSON.parse(value);
    }
    if (value.trim().startsWith('{', 0)) {
      return JSON.parse(value);
    }
    return value;
  }

  private csvToJSON(csv: string): StockModel[] {
    const csvContents = csv.split('\n');
    const result = [];
    const headerParts = csvContents[0].split(',');
    csvContents.shift();
    for (const line of csvContents) {
      const obj = {};
      const lineParts = line.split(',');
      if (lineParts && Array.isArray(lineParts) && lineParts.length === headerParts.length) {
        for (const header of headerParts) {
          const originalValue: string = lineParts[headerParts.indexOf(header)];
          let value = originalValue
            .split('')
            .map(x => x.replace(new RegExp('[\"\']', 'ig'), ''))
            .join('');
          value = this.sanitizeField(value);
          if (header && header !== '') {
            obj[header] = value;
          }
        }
        result.push(obj);
      }
    }
    return result;
  }

  async import(csv: string, shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const stocks = this.csvToJSON(csv).map((x) => {
      if (x && x.hasOwnProperty('canExpire')) {
        x.canExpire = (x.canExpire.toString().toLowerCase().trim() === 'true');
      }
      if (x && x.hasOwnProperty('downloadable')) {
        x.downloadable = (x.downloadable.toString().toLowerCase().trim() === 'true');
      }
      if (x && x.hasOwnProperty('saleable')) {
        x.saleable = (x.saleable.toString().toLowerCase().trim() === 'true');
      }
      if (x && x.hasOwnProperty('purchasable')) {
        x.purchasable = (x.purchasable.toString().toLowerCase().trim() === 'true');
      }
      if (x && x.hasOwnProperty('stockable')) {
        x.stockable = (x.stockable.toString().toLowerCase().trim() === 'true');
      }
      return x;
    });
    const stocksSync: StockSyncModel[] = [];
    for (const x of stocks) {
      stocksSync.push({
        product: await this.sanitizeProduct(x),
        action: 'upsert'
      });
    }
    await this.setProductsLocalSync(stocksSync, shop);
    await this.setProductsLocal(stocks, shop);
    this.syncStocks(shop);
    return stocks;
  }

  async getProductsRemote(shop: ShopModel, rProducts: StockModel[]): Promise<StockModel[]> {
    init(shop);
    const localProducts = await this.getProductsLocal(shop);
    if (!rProducts) {
      rProducts = localProducts;
    }
    await this.setProductsLocalFromRemote(rProducts, shop);
    return await this.getProductsLocal(shop);
  }

  async search(query: string, shop: ShopModel): Promise<StockModel[]> {
    init(shop);
    const stocks = await this.getProductsLocal(shop);
    return stocks.filter(x => {
      return x?.product?.toLowerCase().includes(query.toLowerCase());
    });
  }

  async deleteProduct(stock: StockModel, shop: ShopModel): Promise<any> {
    init(shop);
    await this.setProductLocalSync({
      product: stock,
      action: 'delete'
    }, shop);
    return this.removeProductLocal(stock, shop).finally(() => this.syncStocks(shop));
  }

  async deleteMany(stocksId: string[], activeShop: ShopModel): Promise<any> {
    init(activeShop);
    // console.log(stocksId.length);
    // @ts-ignore
    await this.removeProductsLocal(stocksId.map(x => {
      return {id: x};
    }), activeShop);
    // @ts-ignore
    await this.setProductsLocalSync(stocksId.map(x => {
      return {
        product: {id: x},
        action: 'delete'
      };
    }), activeShop);
    this.syncStocks(activeShop);
    // }
    return this.getProductsLocal(activeShop);
  }

  async export(activeShop: ShopModel): Promise<string> {
    init(activeShop);
    const columns = [
      'product',
      'category',
      'unit',
      'quantity',
      'retailPrice',
      'wholesalePrice',
      'wholesaleQuantity',
      'purchase',
      'expire',
      'supplier',
      'stockable',
      'saleable',
      'purchasable'
    ];
    const stocks = await this.getProducts(activeShop);
    let csv = '';
    csv = csv.concat(columns.join(',')).concat(',\n');
    stocks.forEach(stock => {
      columns.forEach(column => {
        csv = csv.concat(stock[column] ? stock[column].toString().replace(new RegExp('[,-]', 'ig'), '') : '').concat(', ');
      });
      csv = csv.concat('\n');
    });
    return csv;
  }

  private async sanitizeProduct(x: StockModel): Promise<StockModel> {
    Object.keys(x).forEach(key => {
      if (key.toString().trim() === '') {
        delete x[key];
      }
    });
    if (x && !x.id) {
      delete x._id;
      delete x.createdAt;
      delete x.updatedAt;
      x.id = await sha256(JSON.stringify(x));
      x.createdAt = new Date();
    }
    return x;
  }

}

expose(StockWorker);
