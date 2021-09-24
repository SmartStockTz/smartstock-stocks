import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {DeviceState, MessageService} from '@smartstocktz/core-libs';
import {MatDialog} from '@angular/material/dialog';
import {StockState} from '../states/stock.state';
import {DialogDeleteComponent} from './stock.component';
import {ImportsDialogComponent} from './imports.component';

@Component({
  selector: 'app-stock-products-table-sub-actions',
  template: `
    <div class="product-options-container">
      <button routerLink="/stock/products/create" color="primary" mat-button class="p-button">
        Create
      </button>
      <button class="p-button" [disabled]="stockState.isFetchStocks | async" (click)="reload()" color="primary"
              mat-button>
        Reload
      </button>
      <button class="p-button" [disabled]="stockState.isImportProducts | async" (click)="importProducts()"
              color="primary" mat-button>
        Import
      </button>
      <button class="p-button" [disabled]="stockState.isExportToExcel | async" (click)="exportProducts()"
              color="primary" mat-button>
        Export
      </button>
<!--      <button class="p-button" *ngIf="stockState.selection.selected.length>1"-->
<!--              [disabled]="(stockState.isDeleteStocks | async)===true" mat-button-->
<!--              color="primary"-->
<!--              (click)="createGroupProduct()">-->
<!--        Group ( {{stockState.selection.selected.length}} )-->
<!--      </button>-->
      <button class="p-button" *ngIf="stockState.selection.hasValue()"
              [disabled]="(stockState.isDeleteStocks | async)===true" mat-button
              color="primary"
              (click)="deleteMany()">
        Delete ( {{stockState.selection.selected.length}} )
      </button>
    </div>
  `,
  styleUrls: ['../styles/products-options.style.scss']
})

export class ProductsTableSubActionsComponent implements OnInit, OnDestroy {

  @Output() done = new EventEmitter();

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
  }

  createGroupProduct(): void {

  }
}
