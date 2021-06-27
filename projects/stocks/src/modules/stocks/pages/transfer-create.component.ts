import {Component, OnInit} from '@angular/core';
import {DeviceInfoUtil, DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-transfer-create',
  template: `
    <app-layout-sidenav
      [body]="body"
      [leftDrawer]="leftDrawer"
      backLink="/stock/transfers"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [heading]="'Create Transfer'">
      <ng-template #leftDrawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container col-lg-9 col-xl-9 col-sm-11 col-md-10 col-11 pt-3"
             style="padding: 16px 0; min-height: 100vh">
          <div style="margin-top: 5px">
            <app-stock-transfer-create-form></app-stock-transfer-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})

export class TransferCreateComponent implements OnInit {
  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Stock Transfers Create';
  }

  ngOnInit(): void {
  }
}
