import {Injectable} from '@angular/core';
import {IpfsService, UserService} from '@smartstocktz/core-libs';
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
  private changes;

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
    if (!this.changes) {
      const shop = await this.userService.getCurrentShop();
      this.changes = database(shop.projectId)
        .table('categories')
        .query()
        .changes(() => {
          console.log('categories changes connected');
          // if (this.remoteAllProductsRunning === true) {
          //   console.log('another remote fetch is running');
          //   return;
          // }
          // this.getAllCategoryRemote().catch(console.log);
        }, () => {
          console.log('categories changes disconnected');
        });
      this.changes.addListener(async response => {
        if (response && response.body && response.body.change) {
          // console.log(response.body.change);
          if (response.body.change.name === 'create') {
            this.categoryWorker.setCategoryLocal(response.body.change.snapshot, shop).catch(console.log);
          } else if (response.body.change.name === 'update') {
            this.categoryWorker.setCategoryLocal(response.body.change.snapshot, shop).catch(console.log);
          } else if (response.body.change.name === 'delete') {
            await this.categoryWorker.removeCategoryLocal(response.body.change.snapshot, shop);
          } else {
          }
        }
      });
    }
  }

  stopChanges(): void {
    if (this.changes) {
      this.changes.close();
      this.changes = undefined;
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

  private async remoteAllCategories(shop: ShopModel): Promise<CategoryModel[]> {
    // this.remoteAllProductsRunning = true;
    const cids = await database(shop.projectId)
      .collection('categories')
      .getAll<string>({
        cids: true
      }).finally(() => {
        // this.remoteAllProductsRunning = false;
      });
    return await Promise.all(
      cids.map(c => {
        return IpfsService.getDataFromCid(c);
      })
    ) as any[];
  }


  async getAllCategoryRemote(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    await this.startWorker(shop);
    const categories = await this.remoteAllCategories(shop);
    return this.categoryWorker.getCategoriesRemote(shop, categories);
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
