import {expose} from 'comlink';
import {ShopModel} from '@smartstocktz/core-libs/models/shop.model';
import {StockModel} from '../models/stock.model';
import {SecurityUtil} from '@smartstocktz/core-libs';
import {getStockQuantity} from '../utils/stock.util';

// function _init(shop: ShopModel): void {
//   init({
//     applicationId: 'smartstock_lb',
//     projectId: 'smartstock'
//   });
//   init({
//     applicationId: shop.applicationId,
//     projectId: shop.projectId,
//     adapters: {
//       auth: 'DEFAULT'
//     },
//     databaseURL: getDaasAddress(shop),
//     functionsURL: getFaasAddress(shop)
//   }, shop.projectId);
// }

export class StockWorker {

  constructor(shop: ShopModel) {
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
    // const stocks = await this.getProductsLocal(shop);
    return stocks.filter(x => {
      return x?.product?.toLowerCase().includes(query.toLowerCase());
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
      stock.quantity = getStockQuantity(stock);
      for (const column of columns) {
        csv = csv.concat(stock[column] ? stock[column].toString().replace(new RegExp('[,-]', 'ig'), '') : '').concat(', ');
      }
      csv = csv.concat('\n');
    }
    return csv;
  }

  sort(stocks: StockModel[]): StockModel[] {
    stocks.sort((a, b) => {
      if (a?.product?.toLowerCase() < b?.product?.toLowerCase()) {
        return -1;
      }
      if (a?.product?.toLowerCase() > b?.product?.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    return stocks;
  }

}

expose(StockWorker);
