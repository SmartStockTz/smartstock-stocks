import {Injectable} from '@angular/core';
import {database, functions, init} from 'bfast';
import {getDaasAddress, getFaasAddress, SecurityUtil, UserService} from '@smartstocktz/core-libs';
import {TransferModel} from '../models/transfer.model';
import {TransferHeader} from "../models/transfer-header";

@Injectable({
  providedIn: 'root'
})

export class TransferService {
  private COLLECTION = 'transfers';

  constructor(private readonly userService: UserService) {
  }

  async countAll(): Promise<number> {
    const activeShop = await this.userService.getCurrentShop();
    return database(activeShop.projectId).collection(this.COLLECTION).query().count(true).find();
  }

  async save(transfer: TransferModel): Promise<TransferModel> {
    const activeShop = await this.userService.getCurrentShop();
    transfer.id = SecurityUtil.generateUUID();
    const a = await functions(activeShop.projectId)
      .request(getDaasAddress(activeShop) + '/stock/transfer')
      .post(transfer);
    return transfer;
  }

  async fetch(pagination: { size: number, skip: number } = {size: 20, skip: 0}): Promise<TransferModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    return database(activeShop.projectId).collection(this.COLLECTION).query()
      .orderBy('date', 'desc').size(pagination.size).skip(pagination.skip)
      .find();
  }

  searchProduct(transferHeader: TransferHeader, q: string): Promise<any[]> {
    init({
      applicationId: transferHeader.to_shop.applicationId,
      projectId: transferHeader.to_shop.projectId,
      databaseURL: getDaasAddress(transferHeader.to_shop),
      functionsURL: getFaasAddress(transferHeader.to_shop),
      adapters: {
        http: 'DEFAULT',
        cache: 'DEFAULT',
        auth: 'DEFAULT',
      }
    }, transferHeader.to_shop.projectId);
    return database(transferHeader.to_shop.projectId).table('stocks').query()
      .orderBy('product', 'desc')
      .skip(0)
      .size(50)
      .searchByRegex('product', q, 'ig')
      .find({returnFields: ['id', 'product', 'purchase', 'retailPrice', 'wholesalePrice']});
  }
}
