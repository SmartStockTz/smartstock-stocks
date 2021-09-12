import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {TransferState} from '../states/transfer.state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TransferModel} from '../models/transfer.model';
import {PageEvent} from '@angular/material/paginator';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {TransfersItemsViewComponent} from './transfers-items-view.component';
import {TransfersExportOptionsComponent} from './transfers-export-options.component';
import {DeviceState} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-stock-transfers-table',
  template: `
    <table mat-table [dataSource]="transfersDatasource">
      <ng-container cdkColumnDef="date">
        <th mat-header-cell *cdkHeaderCellDef>Date</th>
        <td mat-cell *cdkCellDef="let element">{{element.date | date}}</td>
      </ng-container>
      <ng-container cdkColumnDef="from">
        <th mat-header-cell *cdkHeaderCellDef>From</th>
        <td mat-cell *cdkCellDef="let element">{{element.from_shop.name}}</td>
      </ng-container>
      <ng-container cdkColumnDef="to">
        <th mat-header-cell *cdkHeaderCellDef>To</th>
        <td mat-cell *cdkCellDef="let element">{{element.to_shop.name}}</td>
      </ng-container>
      <ng-container cdkColumnDef="user">
        <th mat-header-cell *cdkHeaderCellDef>Performed By</th>
        <td mat-cell *cdkCellDef="let element">{{element.transferred_by.username}}</td>
      </ng-container>
      <ng-container cdkColumnDef="amount">
        <th mat-header-cell *cdkHeaderCellDef>Amount</th>
        <td mat-cell *cdkCellDef="let element">{{element.amount | number}}</td>
      </ng-container>
      <ng-container cdkColumnDef="note">
        <th mat-header-cell *cdkHeaderCellDef>Message</th>
        <td mat-cell *cdkCellDef="let element">{{element.note}}</td>
      </ng-container>
      <ng-container cdkColumnDef="action">
        <th mat-header-cell *cdkHeaderCellDef>Items</th>
        <td mat-cell *cdkCellDef="let element">

          <button [matTooltip]="'View items'" (click)="viewItems(element)" color="primary" mat-icon-button>
            <mat-icon>visibility</mat-icon>
          </button>

          <button [matTooltip]="'Print items'" mat-icon-button (click)="printTransfer(element)" color="primary">
            <mat-icon>print</mat-icon>
          </button>

        </td>
      </ng-container>
      <tr mat-header-row
          *cdkHeaderRowDef="(deviceState.isSmallScreen | async)===true?transfersTableColumnMobile:transfersTableColumn"></tr>
      <tr mat-row
          *matRowDef="let row; columns (deviceState.isSmallScreen | async)===true?transfersTableColumnMobile:transfersTableColumn"></tr>
    </table>
    <mat-paginator #paginator
                   [disabled]="(transferState.isFetchTransfers | async ) === true"
                   [showFirstLastButtons]="true"
                   [length]="transferState.totalTransfersItems | async"
                   [pageSize]="size"
                   (page)="loadPage($event)"
                   [pageSizeOptions]="[size]">
    </mat-paginator>
  `
})

export class TransfersTableComponent implements OnInit, OnDestroy {
  onDestroy: Subject<any> = new Subject<any>();
  transfersTableColumn = ['date', 'from', 'to', 'user', 'amount', 'note', 'action'];
  transfersTableColumnMobile = ['date', 'amount', 'action'];
  transfersDatasource: MatTableDataSource<TransferModel> = new MatTableDataSource<TransferModel>([]);
  size = 10;
  skip = 0;

  constructor(public readonly transferState: TransferState,
              public readonly deviceState: DeviceState,
              private readonly bottomSheet: MatBottomSheet) {
    transferState.transfers.pipe(
      takeUntil(this.onDestroy)
    ).subscribe(value => {
      this.transfersDatasource.data = value;
    });
  }

  ngOnInit(): void {
    this.transferState.fetch(this.size, this.skip);
    this.transferState.countAll();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  loadPage($event: PageEvent): void {
    this.skip = (($event.pageIndex + 1) * $event.pageSize);
    this.transferState.fetch(this.size, this.skip);
  }

  viewItems(element: TransferModel): void {
    this.bottomSheet.open(TransfersItemsViewComponent, {
      data: {
        transfer: element
      }
    });
  }

  printTransfer(element: TransferModel): void {
    this.bottomSheet.open(TransfersExportOptionsComponent, {
      data: {
        transfer: element
      }
    });
  }
}
