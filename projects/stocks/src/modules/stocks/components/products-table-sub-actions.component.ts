import {Component, OnInit} from '@angular/core';
import {MessageService} from '@smartstocktz/core-libs';
import {MatDialog} from '@angular/material/dialog';
import {StockState} from '../states/stock.state';
import {DialogDeleteComponent} from './stock.component';

@Component({
  selector: 'app-stock-products-table-sub-actions',
  template: `
    <mat-card-subtitle>
      <button [disabled]="(stockState.isDeleteStocks | async)===true" mat-stroked-button mat-button
              color="primary" class="stockbtn"
              (click)="deleteMany()">
        <mat-icon>cached</mat-icon>
        Delete
        <mat-progress-spinner *ngIf="(stockState.isDeleteStocks | async)===true"
                              mode="indeterminate"
                              color="primary"
                              diameter="20px"
                              style="display: inline-block">
        </mat-progress-spinner>
      </button>
    </mat-card-subtitle>
  `
})

export class ProductsTableSubActionsComponent implements OnInit {

  constructor(private readonly dialog: MatDialog,
              private readonly messageService: MessageService,
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

}
