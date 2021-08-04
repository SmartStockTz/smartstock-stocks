import {Component, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';

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
        <div class="container col-lg-9 col-xl-9 col-sm-12 col-md-10 col-12 pt-3"
             style="min-height: 100vh;">
          <div style="margin-top: 4px">
            <app-stock-transfers-table-actions></app-stock-transfers-table-actions>
            <mat-card [class]="(deviceState.isSmallScreen | async) === true?'mat-elevation-z0':'mat-elevation-z2'">
              <app-stock-transfers-table></app-stock-transfers-table>
            </mat-card>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})

export class TransferPage implements OnInit {

  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Stock Transfers';
  }

  ngOnInit(): void {
  }

}
