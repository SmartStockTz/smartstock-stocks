import {MetasModel} from './metas.model';
import {FileModel} from '@smartstocktz/core-libs';

export interface StockModel {
  createdAt?: any;
  catalog?: any[];
  updatedAt?: any;
  image?: any;
  images?: string[];
  id: string;
  product: string;
  barcode?: string;
  saleable?: boolean | true;
  canExpire?: boolean | true;
  description?: string;
  unit?: string;
  category?: string;
  type?: 'simple' | 'subscription';
  subscription?: {
    duration: number,
    grace: number
  };
  downloadable?: boolean | false;
  downloads?: FileModel[];
  stockable?: boolean | true;
  purchasable?: boolean | true;
  quantity?: number | {
    [key: string]: {
      q: number,
      s: string,
      d: string
    }
  };
  wholesaleQuantity?: number;
  reorder?: number;
  purchase?: number;
  retailPrice?: number;
  wholesalePrice?: any;
  supplier?: string;
  expire?: string;
  metas?: MetasModel;
}
