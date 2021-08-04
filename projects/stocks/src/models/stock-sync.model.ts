import {StockModel} from './stock.model';

export interface StockSyncModel {
  product: StockModel;
  action: 'delete' | 'upsert';
}
