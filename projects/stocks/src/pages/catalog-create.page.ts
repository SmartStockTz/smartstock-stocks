import {Component} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-category-create',
  template: `
    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock/catalogs"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Create Catalog"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">>
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container">
          <div class="container col-lg-9 col-xl-9 col-sm-12 col-md-10 col-12" style="min-height: 100vh">
            <app-stock-catalog-create-form></app-stock-catalog-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class CatalogCreatePage {
  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Catalog Create';
  }
}
