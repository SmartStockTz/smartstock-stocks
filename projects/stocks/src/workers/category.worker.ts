import {expose} from 'comlink';
import {ShopModel} from '../models/shop.model';
import {CategoryModel} from '../models/category.model';
import {sha256} from 'crypto-hash';

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

export class CategoryWorker {

  constructor(shop: ShopModel) {
  }

  async sort(categories: CategoryModel[]): Promise<CategoryModel[]> {
    categories.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return categories;
  }

  async search(query: string, categories: CategoryModel[]): Promise<CategoryModel[]> {
    return categories.filter(x => {
      return x?.name?.toLowerCase().includes(query.toLowerCase());
    });
  }

  private async sanitizeCategory(x: CategoryModel): Promise<CategoryModel> {
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


expose(CategoryWorker);
