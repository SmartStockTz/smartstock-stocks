import {Component, OnInit} from '@angular/core';
import {DeviceInfoUtil, DeviceState} from '@smartstocktz/core-libs';
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
      (searchCallback)="handleSearch($event)">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div style="margin: 4px 0">
          <app-stock-products-table-actions></app-stock-products-table-actions>
          <app-stock-products-table></app-stock-products-table>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/stock.style.scss']
})
export class ProductsPage implements OnInit {

  constructor(public readonly stockState: StockState,
              public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Products';
  }

  ngOnInit(): void {
  }


  handleSearch(query: string): void {
    this.stockState.filter(query);
  }

}




