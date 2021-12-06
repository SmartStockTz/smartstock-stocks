import {Injectable} from '@angular/core';
import {TransferModel} from '../models/transfer.model';
import {TransferItem} from '../models/transfer-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor() {
  }

  async findTotal(items: TransferItem[]): Promise<number> {
    return items.map<number>(value => {
      return value.quantity * value.from_purchase;
    }).reduce((a, b) => {
      return a + b;
    }, 0);
  }

  async addToCart(carts: TransferItem[], cart: TransferItem): Promise<any[]> {
    let update = false;
    carts.map(x => {
      if (x.from_id === cart.from_id) {
        x.quantity += cart.quantity;
        update = true;
      }
      return x;
    });
    if (update === false) {
      carts.push(cart);
    }
    return carts;
  }

  async checkout(purchase: TransferModel): Promise<any> {
    // const shop = await this.userService.getCurrentShop();
    // return database(shop.projectId).table('purchases').save(purchase);
  }

  async printCart(carts: any[], channel: string, discount: number, customer: any, printOnly: boolean): Promise<any> {
    // discount = isNaN(discount) ? 0 : discount;
    // const saleItems = await this.cartWorker.cartItemsToSaleItems(carts, discount, channel);
    // const salesItemForPrint = await this.cartWorker.cartItemsToPrinterData(saleItems, customer, channel, discount, printOnly);
    // console.log(salesItemForPrint);
    // await this.printService.print({
    //   data: salesItemForPrint,
    //   printer: 'tm20',
    //   id: SecurityUtil.generateUUID(),
    //   qr: null
    // });
  }
}
