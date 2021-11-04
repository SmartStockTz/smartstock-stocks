import {Component, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {StockState} from '../states/stock.state';

@Component({
  selector: 'app-stocks-index',
  template: `
    <app-layout-sidenav
      searchPlaceholder="Filter product"
      [heading]="'Stocks'"
      [leftDrawer]="side"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [body]="body">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-12 pt-3">
          <div *ngIf="(deviceState.isSmallScreen | async)===false" class="d-flex flex-row flex-wrap" style="padding: 0 10px">
            <app-libs-rbac [groups]="['admin', 'manager']" [pagePath]="page.path" *ngFor="let page of pages">
              <ng-template>
                <div routerLink="{{page.path}}" style="margin: 5px; cursor: pointer">
                  <mat-card matRipple
                            style="width: 150px; height: 150px; display: flex;
                            justify-content: center; align-items: center;
                            flex-direction: column">
                    <mat-icon color="primary" style="font-size: 60px; height: 60px; width: 60px">
                      {{page.icon}}
                    </mat-icon>
                  </mat-card>
                  <p>{{page.name}}</p>
                </div>
              </ng-template>
            </app-libs-rbac>
          </div>
        </div>

        <div *ngIf="(deviceState.isSmallScreen | async)===true">
          <mat-nav-list>
            <app-libs-rbac [groups]="['admin', 'manager']" [pagePath]="page.path" *ngFor="let page of pages">
              <ng-template>
                <mat-list-item routerLink="{{page.path}}">
                  <mat-icon color="primary" matListIcon>{{page.icon}}</mat-icon>
                  <p matLine>{{page.name}}</p>
                  <mat-card-subtitle matLine>{{page.detail}}</mat-card-subtitle>
                </mat-list-item>
                <mat-divider></mat-divider>
              </ng-template>
            </app-libs-rbac>
          </mat-nav-list>
        </div>

        <div class="container col-xl-10 col-lg-10 col-sm-9 col-md-9 col-sm-12 col-12 pt-3" style="">
          <div style="padding: 0" class="d-flex flex-row flex-wrap">
<!--            <app-total-products-summary-->
<!--              class="col-sm-12 col-md-6 col-lg-6 col-xl-6 col-12"></app-total-products-summary>-->
<!--            <app-products-value-summary-->
<!--              class="col-sm-12 col-md-6 col-lg-6 col-xl-6 col-12"></app-products-value-summary>-->
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})

export class IndexPage implements OnInit {
  pages = [
    {
      name: 'Products',
      path: '/stock/products',
      detail: 'Manage products',
      icon: 'redeem'
    },
    {
      name: 'Categories',
      path: '/stock/categories',
      detail: 'Group your products',
      icon: 'list'
    },
    // {
    //   name: 'Catalogs',
    //   path: '/stock/catalogs',
    //   detail: 'Tag your products',
    //   icon: 'loyalty'
    // },
    {
      name: 'Units',
      path: '/stock/units',
      detail: 'Manage unit measures',
      icon: 'straighten'
    },
    {
      name: 'Suppliers',
      path: '/stock/suppliers',
      detail: 'Manage product suppliers',
      icon: 'airport_shuttle'
    },
    {
      name: 'Transfers',
      path: '/stock/transfers',
      detail: 'Move products to other shops',
      icon: 'sync_alt'
    }
  ];

  constructor(public readonly stockState: StockState,
              public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Stocks';
  }

  async ngOnInit(): Promise<void> {
    // this.stockState.getStocksSummary();
  }

}
