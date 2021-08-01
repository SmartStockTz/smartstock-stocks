import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {SupplierState} from '../states/supplier.state';
import {Router} from '@angular/router';

@Component({
  selector: 'app-stock-supplier-edit',
  template: `

    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock/suppliers"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Edit Supplier"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">>
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div [class]="'container col-lg-9 col-xl-9 col-sm-12 col-md-10 col-12 pt-3'"
             style="min-height: 100vh">
          <div style="margin: 4px 0">
            <app-stock-supplier-create-form
              [supplier]="supplierState.selectedForEdit | async"></app-stock-supplier-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class SuppliersEditPage implements OnDestroy, OnInit {
  constructor(public readonly supplierState: SupplierState,
              private readonly router: Router,
              public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Supplier Edit';
  }

  ngOnDestroy(): void {
    this.supplierState.selectedForEdit.next(null);
  }

  ngOnInit(): void {
    if (this.supplierState.selectedForEdit.value === null) {
      this.router.navigateByUrl('/stock/suppliers').catch(_ => {
      });
    }
  }
}
