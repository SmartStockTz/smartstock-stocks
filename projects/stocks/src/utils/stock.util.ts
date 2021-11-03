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
