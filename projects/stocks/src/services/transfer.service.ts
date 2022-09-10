import {Injectable} from '@angular/core';
import {database, functions} from 'bfast';
import {getDaasAddress, SecurityUtil, UserService} from 'smartstock-core';
import {TransferModel} from '../models/transfer.model';
import {TransferHeader} from '../models/transfer-header';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private COLLECTION = 'transfers';

  constructor(private readonly userService: UserService) {
  }

  async countAll(): Promise<number> {
    const activeShop = await this.userService.getCurrentShop();
    return database(activeShop.projectId)
      .collection(this.COLLECTION)
      .query()
      .count(true)
      .find();
  }

  async save(transfer: TransferModel): Promise<TransferModel> {
    const activeShop = await this.userService.getCurrentShop();
    transfer.id = SecurityUtil.generateUUID();
    await functions(activeShop.projectId)
      .request(getDaasAddress(activeShop) + '/stock/transfer')
      .post(transfer);
    return transfer;
  }

  async fetch(
    pagination: { size: number; skip: number } = {size: 20, skip: 0}
  ): Promise<TransferModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    const baseUrl = `https://smartstock-faas.bfast.fahamutech.com/shop/${activeShop.projectId}/${activeShop.applicationId}`;
    const url = `${baseUrl}/stock/transfer?size=${pagination.size}&skip=${pagination.skip}`;
    return functions(activeShop.projectId).request(url).get();
  }

  searchProduct(transferHeader: TransferHeader, q: string): Promise<any[]> {
    q = q.split(' ')[0];
    const url = 'https://smartstock-faas.bfast.fahamutech.com';
    const projectId = transferHeader.to_shop.projectId;
    const applicationId = transferHeader.to_shop.applicationId;
    return functions()
      .request(`${url}/shop/${projectId}/${applicationId}/stock/products?q=${encodeURIComponent(q)}&size=30`)
      .get();
  }
}
