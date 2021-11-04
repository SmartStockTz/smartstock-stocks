import {Component} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-product-quantity-track-page',
  template: `
    <app-layout-sidenav
      [heading]="'Quantity tracking'"
      [leftDrawer]="side"
      [body]="body"
      backLink="/stock/products"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [hasBackRoute]="true"
      [showProgress]="false">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-stock-quantity-tracking></app-stock-quantity-tracking>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: []
})

export class ProductQuantityTrackPage {
  constructor(public readonly deviceState: DeviceState) {
  }
}

