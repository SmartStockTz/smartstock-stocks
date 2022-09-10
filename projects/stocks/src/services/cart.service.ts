import {Injectable} from '@angular/core';
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
}
