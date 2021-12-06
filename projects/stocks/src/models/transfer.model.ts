import {TransferItem} from './transfer-item';

export type TransferModel = {
  id?: string;
  createdAt?: any;
  updatedAt?: any;
  date: string;
  note: string;
  from_shop: {
    name: string;
    projectId: string;
    applicationId: string;
  };
  to_shop: {
    name: string;
    projectId: string;
    applicationId: string;
  };
  transferred_by: {
    username: string;
  };
  amount: number;
  items: TransferItem[];
};
