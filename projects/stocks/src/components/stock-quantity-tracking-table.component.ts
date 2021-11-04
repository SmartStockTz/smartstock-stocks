import {Component, Input, OnInit} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {MatTableDataSource} from '@angular/material/table';
import {getStockQuantity} from '../utils/stock.util';

@Component({
  selector: 'app-stock-quantity-tracking-table',
  template: `
    <div class="sqh-container">
      <table mat-table [dataSource]="tableDataSource">
        <ng-container cdkColumnDef="date">
          <th class="title" mat-header-cell *cdkHeaderCellDef>Date</th>
          <td mat-cell *cdkCellDef="let element">{{element.d  | date:'short'}}</td>
          <td mat-footer-cell *cdkFooterCellDef><b>Current Quantity</b></td>
        </ng-container>
        <ng-container cdkColumnDef="source">
          <th class="title" mat-header-cell *cdkHeaderCellDef>Source</th>
          <td mat-cell *cdkCellDef="let element">{{element.s}}</td>
          <td mat-footer-cell *cdkFooterCellDef></td>
        </ng-container>
        <ng-container cdkColumnDef="in">
          <th class="title" mat-header-cell *cdkHeaderCellDef>In</th>
          <td mat-cell *cdkCellDef="let element">{{element.q > 0 ? element.q : ''}}</td>
          <td mat-footer-cell *cdkFooterCellDef></td>
        </ng-container>
        <ng-container cdkColumnDef="out">
          <th class="title" mat-header-cell *cdkHeaderCellDef>Out</th>
          <td mat-cell *cdkCellDef="let element">{{element.q < 0 ? element.q : ''}}</td>
          <td mat-footer-cell *cdkFooterCellDef><b>{{total}}</b></td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        <tr mat-footer-row *matFooterRowDef="columns"></tr>
      </table>
    </div>
  `,
  styleUrls: ['../styles/stock-quantity-table.style.scss']
})

export class StockQuantityTrackingTableComponent implements OnInit {
  columns = ['date', 'source', 'in', 'out'];
  @Input() stock: StockModel;
  tableDataSource = new MatTableDataSource([]);
  total = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.tableDataSource.data = Object.values(this.stock.quantity);
    this.total = getStockQuantity(this.stock);
  }
}
