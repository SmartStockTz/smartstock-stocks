import {Component, OnDestroy} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {TransferState} from '../states/transfer.state';

@Component({
  selector: 'app-stocks-index',
  template: `
    <app-layout-sidenav
      [body]="body"
      [leftDrawer]="leftDrawer"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      backLink="/stock"
      [hasBackRoute]="true"
      [heading]="'Transfer'">
      <ng-template #leftDrawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-stock-transfer-desktop-ux></app-stock-transfer-desktop-ux>
      </ng-template>
    </app-layout-sidenav>
  `
})

export class TransferPage implements OnDestroy {

  constructor(public readonly deviceState: DeviceState,
              private readonly transferState: TransferState) {
    document.title = 'SmartStock - Stock Transfers';
  }

  ngOnDestroy(): void {
    this.transferState.dispose();
  }

}
