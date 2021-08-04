import {Injectable} from '@angular/core';
import {UserService} from '@smartstocktz/core-libs';
import {CategoryModel} from '../models/category.model';
import {CategoryWorker} from '../workers/category.worker';
import {ShopModel} from '../models/shop.model';
import {wrap} from 'comlink';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryWorker: CategoryWorker;
  private categoryWorkerNative;

  constructor(private readonly userService: UserService) {
  }

  async startWorker(shop: ShopModel): Promise<any> {
    if (!this.categoryWorker) {
      this.categoryWorkerNative = new Worker(new URL('../workers/category.worker', import .meta.url));
      const SW = wrap(this.categoryWorkerNative) as unknown as any;
      this.categoryWorker = await new SW(shop);
    }
  }

  stopWorker(): void {
    if (this.categoryWorkerNative) {
      this.categoryWorkerNative.terminate();
      this.categoryWorker = undefined;
      this.categoryWorkerNative = undefined;
    }
  }

  async addCategory(category: CategoryModel, id = null): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    if (id) {
      category.id = id;
    }
    return this.categoryWorker.saveCategory(category, shop);
  }

  async deleteCategory(category: CategoryModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.deleteCategory(category, shop);
  }

  async getAllCategory(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.getCategories(shop);
  }

  async getAllCategoryRemote(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.getCategoriesRemote(shop);
  }

  async getCategory(id: string): Promise<CategoryModel> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.getCategoryLocal(id, shop);
  }

  async search(q: string): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.search(q, shop);
  }

  async save(category: CategoryModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.saveCategory(category, shop);
  }
}
