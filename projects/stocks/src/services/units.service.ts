import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {getDaasAddress, SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {cache, database} from 'bfast';
import {UnitsModel} from '../models/units.model';

@Injectable({
  providedIn: 'root'
})

export class UnitsService {
  constructor(private readonly httpClient: HttpClient,
              private readonly userService: UserService) {
  }

  async addUnit(unit: UnitsModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    unit.id = SecurityUtil.generateUUID();
    unit.createdAt = new Date().toISOString();
    unit.updatedAt = new Date().toISOString();
    database(shop.projectId).syncs('units').changes().set(unit as any);
    await cache().addSyncs({
      projectId: shop.projectId,
      applicationId: shop.applicationId,
      databaseURL: getDaasAddress(shop),
      tree: 'units',
      action: 'create',
      payload: unit
    });
    return unit;
  }

  async getAllUnit(): Promise<UnitsModel[]> {
    const shop = await this.userService.getCurrentShop();
    const u = database(shop.projectId).syncs('units').changes().values();
    return Array.from(u);
  }

  async getAllUnitRemotely(): Promise<UnitsModel[]> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).syncs('units').upload();
  }

  async updateUnit(unit: { id: string; value: string; field: string }): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const ou = database(shop.projectId).syncs('units').changes().get(unit.id);
    ou[unit.field] = unit.value;
    ou.updatedAt = new Date().toISOString();
    database(shop.projectId).syncs('units').changes().set(ou);
    await cache().addSyncs({
      projectId: shop.projectId,
      applicationId: shop.applicationId,
      databaseURL: getDaasAddress(shop),
      tree: 'units',
      action: 'update',
      payload: ou
    });
    return ou;
  }

  async deleteUnit(unit: UnitsModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    database(shop.projectId).syncs('units').changes().delete(unit.id);
    await cache().addSyncs({
      projectId: shop.projectId,
      applicationId: shop.applicationId,
      databaseURL: getDaasAddress(shop),
      tree: 'units',
      action: 'delete',
      payload: {id: unit.id}
    });
    return {id: unit.id};
  }
}
