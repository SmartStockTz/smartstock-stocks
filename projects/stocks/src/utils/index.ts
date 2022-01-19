import {StockModel} from '../models/stock.model';

export function getStockQuantity(stock: StockModel): number {
  let qty = 0;
  if (stock && isNaN(Number(stock.quantity)) && typeof stock.quantity === 'object') {
    qty = Object.values(stock.quantity).reduce((a, b) => a + b.q, 0);
  }
  if (stock && !isNaN(Number(stock.quantity)) && typeof stock.quantity === 'number') {
    qty = stock.quantity as number;
  }
  return qty;
}

export function getProductFromTransferProduct(value: any): string {
  if (typeof value === 'string') { return value; }
  if (typeof value === 'object' && typeof value.product === 'string') { return value.product; }
  throw {message: 'value must be string or object with product field'};
}
