import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';


@Component({
  selector: 'app-stock-categories',
  template: `
    <app-layout-sidenav
      [heading]="'Categories'"
      [showSearch]="false"
      [searchPlaceholder]="'Type to search'"
      [leftDrawer]="side"
      [body]="body"
      [hasBackRoute]="true"
      backLink="/stock"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [showProgress]="false">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div style="min-height: 100vh">
          <div
            [class]="(deviceState.isSmallScreen | async)===true?'':'container col-lg-9 col-xl-9 col-sm-12 col-md-10 col-12 pt-3'">
            <app-categories></app-categories>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/stock.style.scss']
})
export class CategoriesPage implements OnInit, OnDestroy {

  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Categories';
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}




