import { Component, OnDestroy, OnInit } from "@angular/core";
import { DeviceState } from "smartstock-core";

@Component({
  selector: "app-stock-units",
  template: `
    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock"
      [hasBackRoute]="true"
      [leftDrawerMode]="
        (deviceState.enoughWidth | async) === true ? 'side' : 'over'
      "
      heading="Units"
      [leftDrawerOpened]="(deviceState.enoughWidth | async) === true"
      >>
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div style="margin: 4px 0">
          <app-units></app-units>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ["../styles/stock.style.scss"]
})
export class UnitsPage implements OnInit, OnDestroy {
  constructor(public readonly deviceState: DeviceState) {
    document.title = "SmartStock - Stock Units";
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
