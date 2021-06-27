import {Component} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-category-create',
  template: `
    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock/categories"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Create Category"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-lg-9 col-xl-9 col-sm-11 col-md-10 col-11" style="min-height: 100vh">
          <app-stock-category-create-form></app-stock-category-create-form>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class CategoryCreatePage {
  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Category Create';
  }
}
