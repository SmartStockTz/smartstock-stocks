import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PrintService} from '@smartstocktz/core-libs';
import {SupplierModel} from '../models/supplier.model';
import {Router} from '@angular/router';
import {TransferItem} from '../models/transfer-item';
import {CartService} from '../services/cart.service';
import {TransferService} from '../services/transfer.service';


@Injectable({
  providedIn: 'root'
})
export class CartState {
  carts = new BehaviorSubject<TransferItem[]>([]);
  cartTotal = new BehaviorSubject(0);
  cartTotalItems = new BehaviorSubject(0);
  selectedSupplier = new BehaviorSubject<SupplierModel>(null);

  constructor(private readonly cartService: CartService,
              private readonly printService: PrintService,
              private readonly transferService: TransferService,
              private readonly router: Router,
              private readonly snack: MatSnackBar) {
  }

  private message(reason): void {
    this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
      duration: 2000
    });
  }

  addToCart(item: TransferItem): void {
    this.cartService.addToCart(this.carts.value, item).then(value => {
      this.carts.next(value);
    }).catch(reason => {
      this.message(reason);
    });
  }

  findTotal(items: TransferItem[]): void {
    this.totalItems();
    this.cartService.findTotal(items).then(value => {
      this.cartTotal.next(value);
    }).catch(reason => {
      this.message(reason);
    });
  }

  totalItems(): void {
    this.cartTotalItems.next(
      this.carts.value.map(cartItem => cartItem.quantity).reduce((a, b) => a + b, 0)
    );
  }

  incrementCartItemQuantity(indexOfProductInCart: number): void {
    this.carts.value[indexOfProductInCart].quantity = this.carts.value[indexOfProductInCart].quantity + 1;
    this.carts.next(this.carts.value);
  }

  decrementCartItemQuantity(indexOfProductInCart: number): void {
    if (this.carts.value[indexOfProductInCart].quantity > 1) {
      this.carts.value[indexOfProductInCart].quantity = this.carts.value[indexOfProductInCart].quantity - 1;
      this.carts.next(this.carts.value);
    }
  }

  removeItemFromCart(indexOfProductInCart: number): void {
    this.carts.value.splice(indexOfProductInCart, 1);
    this.carts.next(this.carts.value);
  }

  dispose(): void {
    this.carts.next([]);
    this.cartTotal.next(0);
    this.cartTotalItems.next(0);
    this.selectedSupplier.next(null);
  }
}
