import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {CatalogState} from '../states/catalog.state';
import {Router} from '@angular/router';

@Component({
  selector: 'app-stock-catalog-edit',
  template: `
    <app-layout-sidenav
      [leftDrawer]="drawer" [body]="body"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Edit Catalog"
      backLink="/stock/catalogs"
      [hasBackRoute]="true"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">>
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container">
          <div class="container col-lg-9 col-xl-9 col-sm-11 col-md-10 col-11">
            <app-stock-catalog-create-form
              [catalog]="catalogState.selectedForEdit | async"></app-stock-catalog-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class CatalogEditPage implements OnDestroy, OnInit {
  constructor(public readonly catalogState: CatalogState,
              public readonly deviceState: DeviceState,
              private readonly router: Router) {
    document.title = 'SmartStock - Catalog Edit';
  }

  ngOnDestroy(): void {
    this.catalogState.selectedForEdit.next(null);
  }

  ngOnInit(): void {
    if (this.catalogState.selectedForEdit.value === null) {
      this.router.navigateByUrl('/stock/catalogs').catch(_ => {
      });
    }
  }
}
