import {Component} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-supplier-create',
  template: `
    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock/suppliers"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Create Supplier"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div [class]="'container col-lg-9 col-xl-9 col-sm-12 col-md-10 col-12 pt-3'"
          style="min-height: 100vh">
          <div style="margin: 4px 0">
            <app-stock-supplier-create-form></app-stock-supplier-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class SuppliersCreatePage {
  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Supplier Create';
  }
}
