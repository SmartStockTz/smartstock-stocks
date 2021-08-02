import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {DeviceState, MessageService} from '@smartstocktz/core-libs';
import {MatDialog} from '@angular/material/dialog';
import {StockState} from '../states/stock.state';
import {DialogDeleteComponent} from './stock.component';
import {ImportsDialogComponent} from './imports.component';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-stock-products-table-sub-actions',
  template: `
    <div [class]="(deviceState.isSmallScreen  | async) ===false?'product-options-container':'product-options-container-mobile'">
      <button routerLink="/stock/products/create" color="primary" mat-button>
        <mat-icon>add</mat-icon>
        Create
      </button>
      <button [disabled]="stockState.isFetchStocks | async" (click)="reload()" color="primary" mat-button>
        <mat-icon>refresh</mat-icon>
        Reload
      </button>
      <button [disabled]="stockState.isImportProducts | async" (click)="importProducts()" color="primary" mat-button>
        <mat-icon>file_upload</mat-icon>
        Import
      </button>
      <button [disabled]="stockState.isExportToExcel | async" (click)="exportProducts()" color="primary" mat-button>
        <mat-icon>file_download</mat-icon>
        Export
      </button>
      <button *ngIf="stockState.selection.hasValue()" [disabled]="(stockState.isDeleteStocks | async)===true" mat-button
              color="primary"
              (click)="deleteMany()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </div>
  `,
  styleUrls: ['../styles/products-options.style.scss']
})

export class ProductsTableSubActionsComponent implements OnInit, OnDestroy {

  @Output() done = new EventEmitter();
  // private destroyer = new Subject<any>();

  constructor(private readonly dialog: MatDialog,
              private readonly messageService: MessageService,
              public readonly deviceState: DeviceState,
              public readonly stockState: StockState) {
  }

  ngOnInit(): void {
  }

  deleteMany(): void {
    if (this.stockState.selection.isEmpty()) {
      this.messageService.showMobileInfoMessage(
        'Please select at least one item',
        1000,
        'bottom'
      );
    } else {
      this.dialog.open(DialogDeleteComponent, {
        width: '350',
        data: {title: 'Products'}
      }).afterClosed()
        .subscribe(value => {
          if (value === 'yes') {
            this.stockState.deleteManyStocks(this.stockState.selection);
          } else {
            this.messageService.showMobileInfoMessage('Process cancelled', 3000, 'bottom');
          }
        });
    }
  }

  reload(): void {
    this.stockState.getStocksFromRemote();
  }

  importProducts(): void {
    this.dialog.open(ImportsDialogComponent, {
      closeOnNavigation: true,
    }).afterClosed().subscribe(value => {
      this.done.emit();
    });
  }

  exportProducts(): void {
    this.stockState.exportToExcel();
  }

  ngOnDestroy(): void {
    // this.destroyer.next('done');
  }
}
