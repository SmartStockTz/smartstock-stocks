import { Injectable } from "@angular/core";
import { SecurityUtil, UserService } from "smartstock-core";
import { CategoryModel } from "../models/category.model";
import { CategoryWorker } from "../workers/category.worker";
import { ShopModel } from "../models/shop.model";
import { wrap } from "comlink";
import { cache, database } from "bfast";

@Injectable({
  providedIn: "root"
})
export class CategoryService {
  constructor(private readonly userService: UserService) {}

  private static async withWorker(
    fn: (categoryWorker: CategoryWorker) => Promise<any>
  ): Promise<any> {
    let categoryWorkerNative: Worker;
    try {
      categoryWorkerNative = new Worker(
        new URL("../workers/category.worker", import.meta.url)
      );
      const SW = (wrap(categoryWorkerNative) as unknown) as any;
      const categoryWorker = await new SW();
      return await fn(categoryWorker);
    } finally {
      if (categoryWorkerNative) {
        categoryWorkerNative.terminate();
      }
    }
  }

  async startChanges(): Promise<void> {
    // const shop = await this.userService.getCurrentShop();
  }

  async stopChanges(): Promise<void> {
    // const shop = await this.userService.getCurrentShop();
  }

  async addCategory(
    category: CategoryModel,
    id = null
  ): Promise<CategoryModel> {
    const shop = await this.userService.getCurrentShop();
    if (id) {
      category.id = id;
    } else {
      category.id = SecurityUtil.generateUUID();
    }
    category.createdAt = new Date().toISOString();
    category.updatedAt = new Date().toISOString();
    await database(shop.projectId)
      .table("categories")
      .query()
      .byId(category.id)
      .updateBuilder()
      .upsert(true)
      .doc(category)
      .update();
    cache({ database: shop.projectId, collection: "categories" })
      .set(category.id, category)
      .catch(console.log);
    return category;
  }

  async deleteCategory(category: CategoryModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId)
      .table("categories")
      .query()
      .byId(category.id)
      .delete();
    cache({ database: shop.projectId, collection: "categories" })
      .remove(category.id)
      .catch(console.log);
    return category;
  }

  async getAllCategory(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    return cache({ database: shop.projectId, collection: "categories" })
      .getAll()
      .then((categories) => {
        if (Array.isArray(categories) && categories.length > 0) {
          return categories;
        }
        return this.remoteAllCategories(shop);
      })
      .then(async (c) => {
        const ca = cache({ database: shop.projectId, collection: "categories" });
        await ca.clearAll();
          ca.setBulk(
            c.map((x) => x.id),
            c
          )
          .catch(console.log);
        return c;
      });
  }

  private async remoteAllCategories(shop: ShopModel): Promise<CategoryModel[]> {
    return await database(shop.projectId).table("categories").getAll();
  }

  async getAllCategoryRemote(): Promise<CategoryModel[]> {
    const shop = await this.userService.getCurrentShop();
    return await this.remoteAllCategories(shop);
  }

  async getCategory(id: string): Promise<CategoryModel> {
    const shop = await this.userService.getCurrentShop();
    return cache({ database: shop.projectId, collection: "categories" })
      .get<any>(id)
      .then((category) => {
        if (category) {
          return category;
        }
        return database(shop.projectId).table("categories").get(id);
      });
  }

  async search(q: string): Promise<CategoryModel[]> {
    return CategoryService.withWorker(async (categoryWorker) =>
      categoryWorker.search(q, await this.getAllCategory())
    );
  }

  async save(category: CategoryModel): Promise<any> {
    return this.addCategory(category);
  }
}
