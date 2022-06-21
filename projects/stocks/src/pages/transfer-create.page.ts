import { Component, OnDestroy, OnInit } from "@angular/core";
import { DeviceState } from "smartstock-core";
import { CartState } from "../states/cart.state";
import { StockState } from "../states/stock.state";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TransferHeader } from "../models/transfer-header";
import { TransferState } from "../states/transfer.state";

@Component({
  selector: "app-stock-transfer-create-page",
  template: `
    <app-layout-sidenav
      [body]="body"
      [leftDrawer]="leftDrawer"
      backLink="/stock/transfers"
      [hasBackRoute]="true"
      [hiddenMenu]="hOptions"
      [leftDrawerMode]="
        (deviceState.enoughWidth | async) === true ? 'side' : 'over'
      "
      [leftDrawerOpened]="(deviceState.enoughWidth | async) === true"
      [rightDrawer]="right"
      [showSearch]="true"
      searchPlaceholder="Type to search"
      (searchCallback)="filterProducts($event)"
      [cartBadge]="cartState.cartTotalItems | async"
      [rightDrawerMode]="
        (deviceState.enoughWidth | async) === true ? 'side' : 'over'
      "
      [rightDrawerOpened]="
        (cartState.carts | async)?.length > 0 &&
        (deviceState.isSmallScreen | async) === false
      "
      [heading]="headerData ? 'Transfer to ' + headerData.to_shop.name : ''"
    >
      <ng-template #hOptions>
        <button (click)="stockState.getStocksFromRemote()" mat-menu-item>
          <mat-icon>refresh</mat-icon>
          Reload
        </button>
      </ng-template>
      <ng-template #leftDrawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #right>
        <app-transfer-cart
          *ngIf="headerData"
          [header]="headerData"
        ></app-transfer-cart>
      </ng-template>
      <ng-template #body>
        <app-transfer-create-desktop-ux
          *ngIf="headerData"
          [header]="headerData"
        ></app-transfer-create-desktop-ux>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class TransferCreatePage implements OnInit, OnDestroy {
  headerData: TransferHeader;

  constructor(
    public readonly deviceState: DeviceState,
    public readonly stockState: StockState,
    private readonly activateRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly transferState: TransferState,
    private readonly snack: MatSnackBar,
    public readonly cartState: CartState
  ) {
    document.title = "SmartStock - Stock Transfers Create";
  }

  ngOnInit(): void {
    firstValueFrom(this.activateRoute.queryParams)
      .then((q) => {
        const value = JSON.parse(q.data ? q.data : "{}");
        if (value && value.to_shop && value.note && value.date) {
          this.headerData = value;
        } else {
          this.router.navigateByUrl("/stock/transfers").catch(console.log);
        }
      })
      .catch((_89) => {
        this.snack.open("Fail to get transfer details", "Ok", {
          duration: 2000
        });
        this.router.navigateByUrl("/stock/transfers").catch(console.log);
      });
  }

  filterProducts($event: string): void {
    this.stockState.filter($event);
  }

  ngOnDestroy(): void {
    this.transferState.dispose();
  }
}
