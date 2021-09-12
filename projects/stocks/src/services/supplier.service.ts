import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IpfsService, UserService} from '@smartstocktz/core-libs';
import {StorageService} from '@smartstocktz/core-libs';
import {SupplierModel} from '../models/supplier.model';
import {database} from 'bfast';

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
      return database(shop.projectId)
        .collection('suppliers')
        .query()
        .byId(id)
        .updateBuilder()
        .doc(supplier)
        .update();
    } else {
      return database(shop.projectId)
        .collection('suppliers')
        .save(supplier);
    }
  }

  async deleteSupplier(id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).collection('suppliers').query().byId(id).delete();
  }

  async getAllSupplier(): Promise<SupplierModel[]> {
    const shop = await this.userService.getCurrentShop();
    const cids = await database(shop.projectId)
      .collection<SupplierModel>('suppliers')
      .getAll<string>({
        cids: true
      });
    return await Promise.all(
      cids.map(c => {
        return IpfsService.getDataFromCid(c);
      })
    );
  }

  async updateSupplier(value: { id: string, field: string, value: string }): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const supplierId = value.id;
    const data = {};
    data[value.field] = value.value;
    delete value.id;
    const response = await database(shop.projectId).collection('suppliers')
      .query()
      .byId(supplierId)
      .updateBuilder()
      .set(value.field, value.value)
      .update();
    response.id = supplierId;
    return response;
  }
}
