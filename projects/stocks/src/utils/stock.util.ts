import {StockModel} from '../models/stock.model';

export function getStockQuantity(stock: StockModel): number {
  if (stock && isNaN(Number(stock.quantity)) && typeof stock.quantity === 'object') {
    return Object.values(stock.quantity).reduce((a, b) => a + b.q, 0);
  }
  if (stock && !isNaN(Number(stock.quantity)) && typeof stock.quantity === 'number') {
    return stock.quantity as number;
  }
  return 0;
}
