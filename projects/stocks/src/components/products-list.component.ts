import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {StockModel} from '../models/stock.model';
import {DialogDeleteComponent, StockDetailsComponent} from './stock.component';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StockState} from '../states/stock.state';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatDialog} from '@angular/material/dialog';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-products-list',
  template: `
    <mat-progress-bar *ngIf="stockState.isFetchStocks | async" mode="indeterminate"></mat-progress-bar>
    <cdk-virtual-scroll-viewport class="l-container" [orientation]="'vertical'" [itemSize]="20">
      <mat-nav-list>
        <div *cdkVirtualFor="let element of stockDatasource.connect() | async">
          <mat-list-item [matMenuTriggerFor]="menu">
            <h1 matLine>{{element.product}}</h1>
            <mat-menu #menu>
              <button mat-menu-item [matTooltip]="'change product information'"
                      (click)="viewProduct(element)">View
              </button>
              <button mat-menu-item [matTooltip]="'change product information'"
                      (click)="editStock(element)">Edit
              </button>
              <button mat-menu-item [matTooltip]="'permanent delete stock'"
                      (click)="deleteStock(element)">Delete
              </button>
            </mat-menu>
          </mat-list-item>
          <mat-divider></mat-divider>
        </div>
      </mat-nav-list>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ['../styles/products-list.style.scss']
})

export class ProductsListComponent implements OnInit, OnDestroy {
  stockDatasource = new MatTableDataSource<StockModel>([]);
  onDestroy = new Subject();

  constructor(private readonly router: Router,
              private readonly snack: MatSnackBar,
              public readonly stockState: StockState,
              private readonly dialog: MatDialog,
              private readonly bottomSheet: MatBottomSheet) {
  }

  editStock(element: StockModel): void {
    this.router.navigateByUrl('/stock/products/edit/' + element.id).catch(console.log);
  }

  deleteStock(element: StockModel): void {
    const matDialogRef = this.dialog.open(DialogDeleteComponent, {width: '350', data: {title: element.product}});
    matDialogRef.afterClosed().subscribe(value => {
      if (value === 'no') {
        this.snack.open('Process cancelled', 'Ok', {duration: 3000});
      } else {
        this.stockState.deleteStock(element);
      }
    });
  }

  viewProduct(stock: StockModel): void {
    this.bottomSheet.open(StockDetailsComponent, {
      data: stock,
      closeOnNavigation: true,
    });
  }

  ngOnInit(): void {
    this.stockState.getStocks();
    this.stockState.stocks.pipe(takeUntil(this.onDestroy)).subscribe(stocks => {
      this.stockDatasource.data = stocks;
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next('done');
  }
}
