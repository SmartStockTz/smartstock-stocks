import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';


@Component({
  selector: 'app-stock-suppliers',
  template: `

    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Suppliers"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-suppliers></app-suppliers>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/stock.style.scss']
})
export class SuppliersPage implements OnInit, OnDestroy {

  constructor(public readonly deviceState: DeviceState) {
    document.title = 'SmartStock - Suppliers';
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}




