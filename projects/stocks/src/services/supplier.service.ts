import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {getDaasAddress, SecurityUtil, UserService} from '@smartstocktz/core-libs';
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
    if (id) {
      let os = database(shop.projectId).syncs('suppliers').changes().get(id);
      os.updatedAt = new Date().toISOString();
      os = Object.assign(os, supplier);
      await cache().addSyncs({
        action: 'update',
        payload: os,
        tree: 'suppliers',
        projectId: shop.projectId,
        applicationId: shop.applicationId,
        databaseURL: getDaasAddress(shop)
      });
      database(shop.projectId).syncs('suppliers').changes().set(os);
      return os;
    } else {
      supplier.id = SecurityUtil.generateUUID();
      supplier.createdAt = new Date().toISOString();
      supplier.updatedAt = new Date().toISOString();
      await cache().addSyncs({
        action: 'create',
        payload: supplier,
        tree: 'suppliers',
        projectId: shop.projectId,
        applicationId: shop.applicationId,
        databaseURL: getDaasAddress(shop)
      });
      database(shop.projectId).syncs('suppliers').changes().set(supplier as any);
      return supplier;
    }
  }

  async deleteSupplier(id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await cache().addSyncs({
      action: 'delete',
      payload: {id},
      tree: 'suppliers',
      projectId: shop.projectId,
      applicationId: shop.applicationId,
      databaseURL: getDaasAddress(shop)
    });
    database(shop.projectId).syncs('suppliers').changes().delete(id);
    return {id};
  }

  async getAllSupplier(): Promise<SupplierModel[]> {
    const shop = await this.userService.getCurrentShop();
    const s = await database(shop.projectId).syncs('suppliers').changes().values();
    return Array.from(s);
  }

  async getAllSupplierRemotely(): Promise<SupplierModel[]> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).syncs('suppliers').upload();
  }
}
