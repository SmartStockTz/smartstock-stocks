import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatSidenav } from "@angular/material/sidenav";
import { CartDrawerState, DeviceState, UserService } from "smartstock-core";
import { CartState } from "../states/cart.state";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TransferState } from "../states/transfer.state";
import { TransferHeader } from "../models/transfer-header";

@Component({
  selector: "app-transfer-cart",
  template: `
    <div
      id="cart_view"
      [ngClass]="
        (deviceState.isSmallScreen | async) === true ? 'cart-mobile' : 'cart'
      "
    >
      <mat-toolbar class="mat-elevation-z3" style="z-index: 10000">
        <span
          [matBadge]="cartState.cartTotalItems | async"
          matBadgeOverlap="false"
          >Cart</span
        >
        <span style="flex-grow: 1;"></span>
        <button mat-icon-button (click)="drawer.toggle()" style="float: right;">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>
      <div style="padding-bottom: 500px">
        <mat-list>
          <div *ngFor="let cart of cartState.carts | async; let i = index">
            <mat-list-item matTooltip="{{ cart.product }}">
              <button
                (click)="cartState.removeItemFromCart(i)"
                matSuffix
                mat-icon-button
              >
                <mat-icon color="warn">delete</mat-icon>
              </button>
              <h4 matLine class="text-truncate">{{ cart.product }}</h4>
              <mat-card-subtitle matLine>
                {{ cart.quantity | number }} @
                {{ cart.from_purchase | number }} =
                {{ cart.quantity * cart.from_purchase | number }}
              </mat-card-subtitle>
              <div class="d-flex flex-row" matLine>
                <button
                  color="primary"
                  (click)="cartState.decrementCartItemQuantity(i)"
                  mat-icon-button
                >
                  <mat-icon>remove_circle</mat-icon>
                </button>
                <button
                  color="primary"
                  (click)="cartState.incrementCartItemQuantity(i)"
                  mat-icon-button
                >
                  <mat-icon>add_circle</mat-icon>
                </button>
              </div>
            </mat-list-item>
            <mat-divider
              style="margin-left: 5%; margin-right: 5%; margin-top: 4px"
            ></mat-divider>
          </div>
        </mat-list>
      </div>
      <div
        style="padding: 8px 8px 16px 8px;bottom: 0;width: 100%;position: absolute;background-color: white;z-index: 1000;"
      >
        <mat-divider style="margin-bottom: 7px"></mat-divider>
        <div class="checkout-container">
          <button
            [disabled]="(transferState.addTransferProgress | async) === true"
            (click)="checkout()"
            style="width: 100%;text-align:left;height: 48px;font-size: 18px"
            color="primary"
            mat-flat-button
          >
            <span style="float: left;">{{
              cartState.cartTotal | async | number
            }}</span>
            <mat-progress-spinner
              *ngIf="(transferState.addTransferProgress | async) === true"
              mode="indeterminate"
              diameter="25"
              style="display: inline-block; float: right"
            >
            </mat-progress-spinner>
            <span
              style="float: right"
              *ngIf="(transferState.addTransferProgress | async) === false"
              >Record</span
            >
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["../styles/cart.style.scss"]
})
export class TransferCart implements OnInit, OnDestroy {
  drawer: MatSidenav;
  supplierFormControl = new UntypedFormControl("", [
    Validators.nullValidator,
    Validators.required,
    Validators.minLength(1)
  ]);
  destroyer = new Subject();
  currentUser: any;
  @Input() header: TransferHeader;

  constructor(
    public readonly userService: UserService,
    public readonly cartState: CartState,
    public readonly deviceState: DeviceState,
    public readonly snack: MatSnackBar,
    public readonly cartDrawerState: CartDrawerState,
    public readonly transferState: TransferState
  ) {}

  ngOnDestroy(): void {
    this.destroyer.next("done");
    this.cartState.dispose();
    this.transferState.dispose();
  }

  ngOnInit(): void {
    this.cartDrawerState.drawer
      .pipe(takeUntil(this.destroyer))
      .subscribe((value) => {
        if (value) {
          this.drawer = value;
        }
      });
    this.cartState.carts.pipe(takeUntil(this.destroyer)).subscribe((value) => {
      if (Array.isArray(value)) {
        this.cartState.findTotal(value);
      }
    });
  }

  checkout(): void {
    let fromshop;
    this.userService
      .getCurrentShop()
      .then((shop) => {
        fromshop = {
          applicationId: shop.applicationId,
          projectId: shop.projectId,
          name: shop.businessName
        };
        return this.userService.currentUser();
      })
      .then((user) => {
        this.transferState.save({
          date: this.header.date,
          to_shop: this.header.to_shop,
          from_shop: fromshop,
          transferred_by: {
            username: user.username
          },
          amount: this.cartState.cartTotal.value,
          items: this.cartState.carts.value,
          note: this.header.note
        });
      });
  }
}
