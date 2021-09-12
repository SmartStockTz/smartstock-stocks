import {expose} from 'comlink';
import {ShopModel} from '../models/shop.model';
import * as bfast from 'bfast';
import {CategoryModel} from '../models/category.model';
import {CategorySyncModel} from '../models/category-sync.model';
import {sha256} from "crypto-hash";

function init(shop: ShopModel): void {
  bfast.init({
    applicationId: 'smartstock_lb',
    projectId: 'smartstock'
  });
  bfast.init({
    applicationId: shop.applicationId,
    projectId: shop.projectId,
    adapters: {
      auth: 'DEFAULT'
    }
  }, shop.projectId);
}

export class CategoryWorker {
  private syncInterval;

  constructor(shop: ShopModel) {
    init(shop);
  }

  // ******local cache********* //

  private async categoriesLocalMap(shop: ShopModel): Promise<{ [key: string]: CategoryModel }> {
    init(shop);
    const categoriesSyncMap = await this.categoriesLocalSyncMap(shop);
    const categoriesMap: { [key: string]: CategoryModel } = await bfast
      .cache({database: 'categories', collection: 'categories'}, shop.projectId)
      .get('all');
    if (
      categoriesMap &&
      !Array.isArray(categoriesMap) &&
      Array.isArray(Object.values(categoriesMap))
    ) {
      Object.keys(categoriesMap).forEach(k => {
        if (categoriesSyncMap[k]?.action === 'delete') {
          delete categoriesMap[k];
        }
      });
      return categoriesMap;
    } else {
      return {};
    }
  }

  async getCategoryLocal(id: string, shop: ShopModel): Promise<CategoryModel> {
    init(shop);
    const categoriesMap = await this.categoriesLocalMap(shop);
    return categoriesMap[id];
  }

  async getCategoriesLocal(shop: ShopModel): Promise<CategoryModel[]> {
    init(shop);
    const categoriesMap = await this.categoriesLocalMap(shop);
    // const categoriesSyncMap = await this.categoriesLocalSyncMap(shop);
    // console.log(ps);
    return Object.values(categoriesMap);
    // .filter(x => {
    //   return (!categoriesSyncMap[x.id] || categoriesSyncMap[x.id].action !== 'delete');
    // });
  }

  async removeCategoryLocal(category: CategoryModel, shop: ShopModel): Promise<string> {
    init(shop);
    const categoriesMap = await this.categoriesLocalMap(shop);
    delete categoriesMap[category.id];
    await bfast
      .cache({database: 'categories', collection: 'categories'}, shop.projectId)
      .set('all', categoriesMap);
    return category.id;
  }

  async removeCategoriesLocal(categories: CategoryModel[], shop: ShopModel): Promise<string[]> {
    init(shop);
    const categoriesMap = await this.categoriesLocalMap(shop);
    categories.forEach(x => {
      delete categoriesMap[x.id];
    });
    await bfast
      .cache({database: 'categories', collection: 'categories'}, shop.projectId)
      .set('all', categoriesMap);
    return categories.map(x => x.id);
  }

  async setCategoryLocal(category: CategoryModel, shop: ShopModel): Promise<CategoryModel> {
    init(shop);
    const categoriesMap = await this.categoriesLocalMap(shop);
    categoriesMap[category.id] = category;
    await bfast
      .cache({database: 'categories', collection: 'categories'}, shop.projectId)
      .set('all', categoriesMap);
    return category;
  }

  async setCategoriesLocal(categories: CategoryModel[], shop: ShopModel): Promise<CategoryModel[]> {
    init(shop);
    let categoriesMap = await this.categoriesLocalMap(shop);
    categoriesMap = categories.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, categoriesMap);
    await bfast
      .cache({database: 'categories', collection: 'categories'}, shop.projectId)
      .set('all', categoriesMap);
    return categories;
  }

  async setCategoriesLocalFromRemote(categories: CategoryModel[], shop: ShopModel): Promise<CategoryModel[]> {
    init(shop);
    const categoriesSyncMap = await this.categoriesLocalSyncMap(shop);
    Object.keys(categoriesSyncMap).forEach(k => {
      if (categoriesSyncMap[k].action === 'upsert') {
        categories.push(categoriesSyncMap[k].category);
      }
    });
    const categoriesMap = categories.reduce((a, b) => {
      a[b.id] = b;
      return a;
    }, {});
    await bfast
      .cache({database: 'categories', collection: 'categories'}, shop.projectId)
      .set('all', categoriesMap);
    return categories;
  }

  // ******local sync cache********* //

  private async categoriesLocalSyncMap(shop: ShopModel): Promise<{ [key: string]: CategorySyncModel }> {
    init(shop);
    const categoriesMap: { [key: string]: CategorySyncModel } = await bfast
      .cache({database: 'categories', collection: 'categories_sync'}, shop.projectId)
      .get('all');
    if (
      categoriesMap &&
      !Array.isArray(categoriesMap) &&
      Array.isArray(Object.values(categoriesMap))
    ) {
      return categoriesMap;
    } else {
      return {};
    }
  }

  async setCategoriesLocalSync(categoriesLocalSync: CategorySyncModel[], shop: ShopModel): Promise<CategorySyncModel[]> {
    init(shop);
    let categoriesMap = await this.categoriesLocalSyncMap(shop);
    categoriesMap = categoriesLocalSync.reduce((a, b) => {
      a[b.category.id] = b;
      return a;
    }, categoriesMap);
    await bfast
      .cache({database: 'categories', collection: 'categories_sync'}, shop.projectId)
      .set('all', categoriesMap);
    return categoriesLocalSync;
  }

  async setCategoryLocalSync(categorySync: CategorySyncModel, shop: ShopModel): Promise<CategorySyncModel> {
    init(shop);
    const categoriesMap = await this.categoriesLocalSyncMap(shop);
    categoriesMap[categorySync.category.id] = categorySync;
    await bfast
      .cache({database: 'categories', collection: 'categories_sync'}, shop.projectId)
      .set('all', categoriesMap);
    return categorySync;
  }

  async getCategoriesLocalSync(shop: ShopModel): Promise<CategorySyncModel[]> {
    init(shop);
    const categoriesMap = await this.categoriesLocalSyncMap(shop);
    return Object.values(categoriesMap);
  }

  async removeCategoryLocalSync(id: string, shop: ShopModel): Promise<string> {
    init(shop);
    const categoriesMap = await this.categoriesLocalSyncMap(shop);
    delete categoriesMap[id];
    await bfast
      .cache({database: 'categories', collection: 'categories_sync'}, shop.projectId)
      .set('all', categoriesMap);
    return id;
  }

  async removeCategoriesLocalSync(ids: string[], shop: ShopModel): Promise<string[]> {
    init(shop);
    const categoriesMap = await this.categoriesLocalSyncMap(shop);
    ids.forEach(id => {
      delete categoriesMap[id];
    });
    await bfast
      .cache({database: 'categories', collection: 'categories_sync'}, shop.projectId)
      .set('all', categoriesMap);
    return ids;
  }


  private remoteCategoriesMapping(categories: CategoryModel[], hashesMap): CategoryModel[] {
    if (Array.isArray(categories)) {
      categories = categories.map(x => {
        if (hashesMap[x.toString()]) {
          return hashesMap[x.toString()];
        } else {
          return x;
        }
      });
    }
    return categories;
  }

  private syncCategories(shop: ShopModel): void {
    init(shop);
    let isRunn = false;
    if (this.syncInterval) {
      return;
    }
    console.log('category sync start');
    this.syncInterval = setInterval(async () => {
      if (isRunn === true) {
        return;
      }
      isRunn = true;
      const categorySyncModels: CategorySyncModel[] = await this.getCategoriesLocalSync(shop);
      if (Array.isArray(categorySyncModels) && categorySyncModels.length === 0) {
        isRunn = false;
        clearInterval(this.syncInterval);
        this.syncInterval = undefined;
        console.log('category sync stop');
      } else {
        const upserts = categorySyncModels.filter(x => x.action === 'upsert');
        const deletes = categorySyncModels.filter(x => x.action === 'delete');
        try {
          if (upserts?.length > 0) {
            const daasUrl = `https://${shop.projectId}-daas.bfast.fahamutech.com/v2`;
            const r: any = await bfast.functions(shop.projectId)
              .request(daasUrl)
              .post({
                applicationId: shop.applicationId,
                updatecategories: upserts.map(u => {
                  return {
                    id: u.category.id,
                    update: {
                      $set: u.category
                    },
                    upsert: true,
                    return: ['id']
                  };
                })
              });
            if (r && r.updatecategories) {
              // console.log(r.updatestocks);
            } else {
              throw r;
            }
            await this.removeCategoriesLocalSync(upserts.map(k => k.category.id), shop);
          }
          if (deletes?.length > 0) {
            await bfast.database(shop.projectId)
              .table('categories')
              .query()
              .size(deletes.length)
              .skip(0)
              .includesIn('id', deletes.map(d => d.category.id))
              .delete();
            await this.removeCategoriesLocalSync(deletes.map(d => d.category.id), shop);
          }
        } catch (e) {
          console.log(e);
        }
        isRunn = false;
      }
    }, 2000);
  }

  async deleteCategory(category: CategoryModel, shop): Promise<any> {
    init(shop);
    await this.setCategoryLocalSync({
      category,
      action: 'delete'
    }, shop);
    return this.removeCategoryLocal(category, shop).finally(() => this.syncCategories(shop));
  }

  async getCategories(shop: ShopModel): Promise<CategoryModel[]> {
    init(shop);
    const products = await this.getCategoriesLocal(shop);
    if (Array.isArray(products) && products.length > 0) {
      return products;
    } else {
      return [];
    }
  }

  async getCategoriesRemote(shop: ShopModel, rCategories): Promise<CategoryModel[]> {
    init(shop);
    const localCategories = await this.getCategoriesLocal(shop);
    if (!rCategories) {
      rCategories = localCategories;
    }
    await this.setCategoriesLocalFromRemote(rCategories, shop);
    return await this.getCategoriesLocal(shop);
  }

  async saveCategory(category: CategoryModel, shop: ShopModel): Promise<CategoryModel> {
    init(shop);
    category = await this.sanitizeCategory(category);
    await this.setCategoryLocalSync({
      category,
      action: 'upsert'
    }, shop);
    await this.setCategoryLocal(category, shop);
    this.syncCategories(shop);
    return category;
  }

  async search(query: string, shop: ShopModel): Promise<CategoryModel[]> {
    init(shop);
    const stocks = await this.getCategoriesLocal(shop);
    return stocks.filter(x => {
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
