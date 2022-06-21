import { Component, OnDestroy, OnInit } from "@angular/core";
import { DeviceState } from "smartstock-core";
import { StockState } from "../states/stock.state";
import { ImportsDialogComponent } from "../components/imports.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-stock-products",
  template: `
    <app-layout-sidenav
      [heading]="'Products'"
      [searchPlaceholder]="'Type to search'"
      showSearch="true"
      backLink="/stock"
      [hasBackRoute]="true"
      [leftDrawer]="side"
      [body]="body"
      [visibleMenu]="vOptions"
      [hiddenMenu]="hOptions"
      [leftDrawerMode]="
        (deviceState.enoughWidth | async) === true ? 'side' : 'over'
      "
      [leftDrawerOpened]="(deviceState.enoughWidth | async) === true"
      [searchProgressFlag]="stockState.isSearchProducts | async"
      (searchCallback)="handleSearch($event)"
    >
      <ng-template #vOptions>
        <button routerLink="/stock/products/create" mat-icon-button>
          <mat-icon>add</mat-icon>
        </button>
      </ng-template>
      <ng-template #hOptions>
        <button
          [disabled]="stockState.isFetchStocks | async"
          (click)="reload()"
          mat-menu-item
        >
          <mat-icon>refresh</mat-icon>
          Reload
        </button>
        <button
          [disabled]="stockState.isImportProducts | async"
          (click)="importProducts()"
          mat-menu-item
        >
          <mat-icon>file_upload</mat-icon>
          Import
        </button>
        <button
          [disabled]="stockState.isExportToExcel | async"
          (click)="exportProducts()"
          mat-menu-item
        >
          <mat-icon>file_download</mat-icon>
          Export
        </button>
      </ng-template>
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <app-products-table
          *ngIf="(deviceState.isSmallScreen | async) === false"
        ></app-products-table>
        <app-products-list
          *ngIf="(deviceState.isSmallScreen | async) === true"
        ></app-products-list>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ["../styles/stock.style.scss"]
})
export class ProductsPage implements OnInit, OnDestroy {
  constructor(
    public readonly stockState: StockState,
    private readonly dialog: MatDialog,
    public readonly deviceState: DeviceState
  ) {
    document.title = "SmartStock - Products";
  }

  ngOnInit(): void {
    this.stockState.startChanges();
  }

  handleSearch(query: string): void {
    this.stockState.filter(query);
  }

  ngOnDestroy(): void {
    this.stockState.stopChanges();
  }

  reload(): void {
    this.stockState.getStocksFromRemote();
  }

  importProducts(): void {
    this.dialog.open(ImportsDialogComponent, {
      closeOnNavigation: true
    });
  }

  exportProducts(): void {
    this.stockState.exportToExcel();
  }
}
