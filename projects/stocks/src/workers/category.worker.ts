import {expose} from 'comlink';
import {CategoryModel} from '../models/category.model';

export class CategoryWorker {

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
}


expose(CategoryWorker);
