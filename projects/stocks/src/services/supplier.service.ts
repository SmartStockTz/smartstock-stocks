import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {SupplierModel} from '../models/supplier.model';
import {cache, database} from 'bfast';

@Injectable({
  providedIn: 'root'
})

export class SupplierService {
  constructor(private readonly httpClient: HttpClient,
              private readonly userService: UserService) {
  }

  async addSupplier(supplier: SupplierModel, id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const sCache = cache({database: shop.projectId, collection: 'suppliers'});
    if (id) {
      supplier.updatedAt = new Date().toISOString();
      await database(shop.projectId).table('suppliers').query().byId(id)
        .updateBuilder().doc(supplier).update();
      sCache.set(id, supplier).catch(console.log);
      return supplier;
    } else {
      supplier.id = SecurityUtil.generateUUID();
      supplier.createdAt = new Date().toISOString();
      supplier.updatedAt = new Date().toISOString();
      await database(shop.projectId).table('suppliers').query().byId(supplier.id).updateBuilder()
        .doc(supplier)
        .update();
      sCache.set(supplier.id, supplier).catch(console.log);
      return supplier;
    }
  }

  async deleteSupplier(id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId).table('suppliers').query().byId(id).delete();
    cache({database: shop.projectId, collection: 'suppliers'}).remove(id).catch(console.log);
    return {id};
  }

  async getAllSupplier(): Promise<SupplierModel[]> {
    const shop = await this.userService.getCurrentShop();
    return cache({database: shop.projectId, collection: 'suppliers'}).getAll().then(suppliers => {
      if (Array.isArray(suppliers) && suppliers.length > 0) {
        return suppliers;
      }
      return this.getAllSupplierRemotely();
    }).then(s => {
      cache({database: shop.projectId, collection: 'suppliers'})
        .setBulk(s.map(x => x.id), s).catch(console.log);
      return s;
    });
  }

  async getAllSupplierRemotely(): Promise<SupplierModel[]> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).table('suppliers').getAll();
  }
}
