import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {MatTableDataSource} from '@angular/material/table';
import {getStockQuantity} from '../utils/util';
import {MatPaginator} from '@angular/material/paginator';
import {StockService} from '../services/stock.service';

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
      <mat-paginator [pageSize]="50" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styleUrls: ['../styles/stock-quantity-table.style.scss']
})

export class StockQuantityTrackingTableComponent implements OnInit, AfterViewInit {
  columns = ['date', 'source', 'in', 'out'];
  @Input() stock: StockModel;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  tableDataSource = new MatTableDataSource([]);
  total = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.total = getStockQuantity(this.stock);
  }

  ngAfterViewInit(): void {
    this.tableDataSource.paginator = this.paginator;
  }
}
