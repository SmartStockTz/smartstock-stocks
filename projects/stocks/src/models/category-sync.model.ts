import {CategoryModel} from './category.model';

export interface CategorySyncModel {
  action: 'upsert' | 'delete';
  category: CategoryModel;
}
