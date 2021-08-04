import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {StockState} from '../states/stock.state';


@Component({
  selector: 'app-stock-products',
  template: `
    <app-layout-sidenav
      [heading]="'Products'"
      [searchPlaceholder]="'Type to search'"
      showSearch="true"
      backLink="/stock"
      [hasBackRoute]="true"
      [leftDrawer]="side"
      [body]="body"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [searchProgressFlag]="stockState.isSearchProducts | async"
      (searchCallback)="handleSearch($event)">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-stock-products-table></app-stock-products-table>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/stock.style.scss']
})
export class ProductsPage implements OnInit, OnDestroy {

  constructor(public readonly stockState: StockState,
              public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Products';
  }

  ngOnInit(): void {
    this.stockState.startChanges();
  }


  handleSearch(query: string): void {
    this.stockState.filter(query);
  }

  ngOnDestroy(): void {
    this.stockState.stopChanges();
  }

}




