import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SecurityUtil, UserService } from "smartstock-core";
import { cache, database } from "bfast";
import { UnitsModel } from "../models/units.model";

@Injectable({
  providedIn: "root"
})
export class UnitsService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly userService: UserService
  ) {}

  async addUnit(unit: UnitsModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    unit.id = SecurityUtil.generateUUID();
    unit.createdAt = new Date().toISOString();
    unit.updatedAt = new Date().toISOString();
    await database(shop.projectId)
      .table("units")
      .query()
      .byId(unit.id)
      .updateBuilder()
      .upsert(true)
      .doc(unit)
      .update();
    cache({ database: shop.projectId, collection: "units" })
      .set(unit.id, unit)
      .catch(console.log);
    return unit;
  }

  async getAllUnit(): Promise<UnitsModel[]> {
    const shop = await this.userService.getCurrentShop();
    return cache({ database: shop.projectId, collection: "units" })
      .getAll()
      .then((units) => {
        if (Array.isArray(units) && units.length > 0) {
          return units;
        }
        return this.getAllUnitRemotely();
      })
      .then((u) => {
        cache({ database: shop.projectId, collection: "units" })
          .setBulk(
            u.map((x) => x.id),
            u
          )
          .catch(console.log);
        return u;
      });
  }

  async getAllUnitRemotely(): Promise<UnitsModel[]> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId).table("units").getAll();
  }

  async updateUnit(unit: {
    id: string;
    value: string;
    field: string;
  }): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    const u = await database(shop.projectId)
      .table("units")
      .query()
      .byId(unit.id)
      .updateBuilder()
      .upsert(true)
      .set(unit.field, unit.value)
      .update();
    cache({ database: shop.projectId, collection: "units" })
      .set(u.id, u)
      .catch(console.log);
  }

  async deleteUnit(unit: UnitsModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId)
      .table("units")
      .query()
      .byId(unit.id)
      .delete();
    cache({ database: shop.projectId, collection: "units" })
      .remove(unit.id)
      .catch(console.log);
    return { id: unit.id };
  }
}
