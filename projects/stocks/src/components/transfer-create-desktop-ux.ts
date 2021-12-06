import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {StockState} from '../states/stock.state';
import {CartState} from '../states/cart.state';
import {TransferHeader} from '../models/transfer-header';

@Component({
  selector: 'app-transfer-create-desktop-ux',
  template: `
    <app-on-fetch [isLoading]="(stockState.isFetchStocks | async)==true"
                  *ngIf="(stockState.isFetchStocks | async)==true"
                  (refreshCallback)="getProductsRemote()">
    </app-on-fetch>
    <cdk-virtual-scroll-viewport style="height: 100%"
                                 *ngIf="(stockState.isFetchStocks | async) === false"
                                 itemSize="30">
      <mat-nav-list>
        <app-product-tile style="margin: 0 3px; display: inline-block"
                          [transferHeader]="header"
                     [stock]="product"
                     *cdkVirtualFor="let product of stockState.stocks | async; let idx = index">
        </app-product-tile>
        <div style="height: 200px"></div>
      </mat-nav-list>
    </cdk-virtual-scroll-viewport>
    <div class="bottom-actions-container">
      <button mat-button
              [disabled]="(stockState.isFetchStocks | async) === true"
              color="primary"
              style="margin: 16px"
              *ngIf="(cartState.carts  | async)?.length === 0"
              (click)="getProductsRemote()"
              matTooltip="Refresh products from server"
              class="mat-fab">
        <mat-icon>refresh</mat-icon>
      </button>
      <span [ngStyle]="showRefreshCart?{flex: '1 1 auto'}:{}"></span>
    </div>
  `,
  styleUrls: ['../styles/product-tiles.style.scss']
})

export class TransferCreateDesktopUx implements OnInit, OnDestroy {
  @Input() header: TransferHeader;
  showRefreshCart = true;

  constructor(public readonly cartState: CartState,
              public readonly stockState: StockState) {
  }

  getProductsRemote(): void {
    this.stockState.getStocksFromRemote();
  }

  async ngOnInit(): Promise<void> {
    this.stockState.getStocks();
  }

  ngOnDestroy(): void {
  }
}
