import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatDialog} from '@angular/material/dialog';
import {StockState} from '../states/stock.state';
import {ImportsDialogComponent} from './imports.component';

@Component({
  selector: 'app-stock-products-table-actions',
  template: `
    <div class="container col-lg-9 col-xl-9 col-sm-11 col-md-10 col-12 pt-2">
      <mat-card-title class="d-flex flex-row">
        <button routerLink="/stock/products/create" color="primary" class="ft-button" mat-flat-button>
          Add Product
        </button>
        <span class="toolbar-spacer"></span>
        <span style="width: 8px; height: 8px"></span>
        <button (click)="stockState.getStocksFromRemote()"
                [disabled]="(stockState.isFetchStocks | async) === true"
                matTooltip="Reload from server"
                color="primary"
                class="ft-button" mat-flat-button>
          <mat-icon *ngIf="(stockState.isFetchStocks | async) === false">
            refresh
          </mat-icon>
          <mat-progress-spinner *ngIf="(stockState.isFetchStocks | async)===true" [diameter]="20"
                                matTooltip="Fetch products from server"
                                mode="indeterminate"
                                color="primary">
          </mat-progress-spinner>
        </button>

        <button [matMenuTriggerFor]="stockMenu" color="primary" mat-icon-button>
          <mat-icon>more_vert</mat-icon>
        </button>

        <mat-menu #stockMenu>
          <button (click)="hotReloadStocks()" matTooltip="refresh products in table" mat-menu-item>Hot
            Reload
          </button>
          <button (click)="exportStock()" [disabled]="(stockState.isExportToExcel | async)===true"
                  matTooltip="Export Products To Csv"
                  mat-menu-item>
            Download as cvs
            <mat-progress-spinner *ngIf="(stockState.isExportToExcel | async)===true" [diameter]="20"
                                  matTooltip="Export Products InProgress.."
                                  mode="indeterminate"
                                  color="primary">
            </mat-progress-spinner>
          </button>
          <button (click)="importStocks()"
                  matTooltip="Import Products"
                  mat-menu-item>
            Upload a cvs
          </button>
        </mat-menu>
      </mat-card-title>
    </div>
  `
})

export class ProductsTableActionsComponent implements OnInit {

  constructor(private readonly dialog: MatDialog,
              public readonly stockState: StockState) {
  }

  ngOnInit(): void {

  }

  hotReloadStocks(): void {
    this.stockState.getStocks();
  }

  exportStock(): void {
    this.stockState.exportToExcel();
  }

  importStocks(): void {
    this.dialog.open(ImportsDialogComponent, {
      closeOnNavigation: true,
    });
  }

}
