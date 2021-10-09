import {Injectable} from '@angular/core';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {CategoryModel} from '../models/category.model';
import {CategoryWorker} from '../workers/category.worker';
import {ShopModel} from '../models/shop.model';
import {wrap} from 'comlink';
import {database} from 'bfast';

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

  async startChanges(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('categories');
  }

  async stopChanges(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('categories').close();
  }

  async addCategory(category: CategoryModel, id = null): Promise<CategoryModel> {
    const shop = await this.userService.getCurrentShop();
    if (id) {
      category.id = id;
    }else {
      category.id = SecurityUtil.generateUUID();
    }
    category.createdAt = new Date().toISOString();
    category.updatedAt = new Date().toISOString();
    database(shop.projectId).syncs('categories')
      .changes()
      .set(category as any);
    return category;
  }

  async deleteCategory(category: CategoryModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('categories')
      .changes()
      .delete(category.id);
    return category;
  }

  async getAllCategory(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const c = database(shop.projectId).syncs('categories')
      .changes()
      .values();
    return this.categoryWorker.sort(Array.from(c));
  }

  private async remoteAllCategories(shop: ShopModel): Promise<CategoryModel[]> {
    const cr = await database(shop.projectId)
      .syncs('categories')
      .upload();
    await this.startWorker(shop);
    return this.categoryWorker.sort(cr);
  }


  async getAllCategoryRemote(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    return await this.remoteAllCategories(shop);
  }

  async getCategory(id: string): Promise<CategoryModel> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).syncs('categories').changes().get(id);
  }

  async search(q: string): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    return this.categoryWorker.search(q, await this.getAllCategory());
  }

  async save(category: CategoryModel): Promise<any> {
    return this.addCategory(category);
  }
}
