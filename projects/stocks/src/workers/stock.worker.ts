import {expose} from 'comlink';
import {StockModel} from '../models/stock.model';
import {getDaasAddress, getFaasAddress, SecurityUtil} from '@smartstocktz/core-libs';
import {cache, database, init} from 'bfast';
import {ShopModel} from '../models/shop.model';
import {sha1} from 'crypto-hash';

export class StockWorker {

  private static sanitizeField(value: string): any {
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

  getStockQuantity(stock: StockModel): number {
    if (stock && isNaN(Number(stock.quantity)) && typeof stock.quantity === 'object') {
      // @ts-ignore
      return Object.values(stock.quantity).reduce<any>((a, b) => a + b.q, 0);
    }
    if (stock && !isNaN(Number(stock.quantity)) && typeof stock.quantity === 'number') {
      return stock.quantity as number;
    }
    return 0;
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
          value = StockWorker.sanitizeField(value);
          if (header && header !== '') {
            obj[header] = value;
          }
        }
        result.push(obj);
      }
    }
    return result;
  }

  async import(csv: string): Promise<StockModel[]> {
    return this.csvToJSON(csv).map((x) => {
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
      x.id = SecurityUtil.generateUUID();
      x.createdAt = new Date().toISOString();
      x.updatedAt = new Date().toISOString();
      return x;
    });
  }

  async search(query: string, stocks: StockModel[]): Promise<StockModel[]> {
    return stocks.filter(x => {
      return x && x.product ? x.product.toString().toLowerCase().includes(query.toLowerCase()) : false;
    });
  }

  async export(stocks: StockModel[]): Promise<string> {
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
    let csv = '';
    csv = csv.concat(columns.join(',')).concat(',\n');
    for (const stock of stocks) {
      stock.quantity = this.getStockQuantity(stock);
      for (const column of columns) {
        csv = csv.concat(stock[column] ? stock[column].toString().replace(new RegExp('[,-]', 'ig'), '') : '').concat(', ');
      }
      csv = csv.concat('\n');
    }
    return csv;
  }

  sort(stocks: StockModel[]): StockModel[] {
    stocks.sort((a, b) => {
      if (a && !a.product) {
        return 0;
      }
      if (b && !b.product) {
        return 0;
      }
      if (a.product.toString().toLowerCase() < b.product.toString().toLowerCase()) {
        return -1;
      }
      if (a.product.toString().toLowerCase() > b.product.toString().toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return stocks;
  }

  async qualifyForCompact(stock: StockModel): Promise<{
    [k: string]: {
      d: string,
      q: number,
      s: string,
      _id: string
    }[]
  }> {
    if (stock && typeof stock.quantity === 'object') {
      const keys = Object.keys(stock.quantity);
      const grouped = keys.reduce((a, b) => {
        const quantityValue = stock.quantity[b];
        quantityValue._id = b;
        if (a[quantityValue.s]) {
          a[quantityValue.s].push(quantityValue);
        } else {
          a[quantityValue.s] = [quantityValue];
        }
        return a;
      }, {});
      for (const k of Object.keys(grouped)) {
        if (grouped[k].length > 1) {
          return grouped;
        }
      }
    }
    return null;
  }

  async compactQuantity(shop: ShopModel): Promise<any> {
    init({
      applicationId: 'smartstock_lb',
      projectId: 'smartstock'
    });
    init({
      applicationId: shop.applicationId,
      projectId: shop.projectId,
      databaseURL: getDaasAddress(shop),
      functionsURL: getFaasAddress(shop)
    }, shop.projectId);
    const stockCache = cache({database: shop.projectId, collection: 'stocks'});
    const keys = await stockCache.keys();
    for (const key of keys) {
      const stock: any = await stockCache.get(key);
      const is = await this.qualifyForCompact(stock);
      if (is) {
        for (const x of Object.keys(is)) {
          if (is[x].length > 1) {
            const unset = is[x].map(y => `quantity.${y._id}`);
            const set = {
              ['quantity.' + await sha1(JSON.stringify(unset))]: {
                d: new Date(),
                s: x,
                q: is[x].reduce((a2, b2) => a2 + b2.q, 0)
              }
            };
            const b = {
              $unset: unset.reduce((a1, b1) => {
                a1[b1] = 1;
                return a1;
              }, {}),
              $set: set
            };
            // console.log(stock.product);
            // console.log(JSON.stringify(b, null, 4));
            const update = database(shop.projectId).table('stocks').query().byId(stock.id).updateBuilder();
            for (const k2 of Object.keys(b.$unset)) {
              update.unset(k2);
            }
            for (const k3 of Object.keys(b.$set)) {
              update.set(k3, b.$set[k3]);
            }
            await update.update({returnFields: ['id']});
            // console.log(n);
            // return;
          } else {
            // JSON.stringify('fuck');
          }
        }
      } else {
        // console.log('not ready for compact');
      }
    }
  }

}

expose(StockWorker);
