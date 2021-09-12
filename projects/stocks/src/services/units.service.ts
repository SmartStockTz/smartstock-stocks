import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IpfsService, UserService} from '@smartstocktz/core-libs';
import {database} from 'bfast';
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
    return database(shop.projectId).collection<UnitsModel>('units').save(unit);
  }

  async getAllUnit(pagination: { size?: number, skip?: number }): Promise<UnitsModel[]> {
    const shop = await this.userService.getCurrentShop();
    const cids = await database(shop.projectId)
      .collection('units')
      .getAll<string>({
        cids: true
      });
    return await Promise.all(
      cids.map(c => {
        return IpfsService.getDataFromCid(c);
      })
    ) as any[];
  }

  async updateUnit(unit: { id: string; value: string; field: string }): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const unitId = unit.id;
    const data = {};
    data[unit.field] = unit.value;
    delete unit.id;
    const response = await database(shop.projectId).collection('units')
      .query()
      .byId(unitId)
      .updateBuilder()
      .set(unit.field, unit.value)
      .update();
    response.id = unitId;
    return response;
  }

  async deleteUnit(unit: UnitsModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).collection('units').query().byId(unit.id).delete();
  }
}
