import {Component, Input, OnInit} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-new',
  template: `
    <app-layout-sidenav
      [heading]="isUpdateMode?'Update Product':'Create Product'"
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
        <app-product-short-detail-form [isUpdateMode]="isUpdateMode"
                                       [initialStock]="initialStock">
        </app-product-short-detail-form>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/create.style.scss']
})
export class CreatePageComponent implements OnInit {
  @Input() isUpdateMode = false;
  @Input() initialStock: StockModel;
  @Input() isLoadingData = false;

  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Product Create';
  }

  ngOnInit(): void {
  }

}
