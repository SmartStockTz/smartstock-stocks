import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Observable, of, Subject} from 'rxjs';
import {Router} from '@angular/router';
import {DeviceState, LogService, StorageService} from '@smartstocktz/core-libs';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {StockState} from '../states/stock.state';
import {takeUntil} from 'rxjs/operators';
import {StockModel} from '../models/stock.model';
import {MatSidenav} from '@angular/material/sidenav';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {DialogDeleteComponent, StockDetailsComponent} from './stock.component';

@Component({
  selector: 'app-stock-products-table',
  template: `
    <div>
      <div [class]="(deviceState.isSmallScreen  | async) ===false?'container-fluid':''">

        <div class="product-table-options">
          <app-stock-products-table-sub-actions (done)="doneInSubMenu()"></app-stock-products-table-sub-actions>
          <mat-paginator [style]="(deviceState.isSmallScreen  | async) ===false?{display:''}:{display:'none'}"
                         #paginator pageSize="50"
                         *ngIf="(deviceState.isSmallScreen  | async) ===false"
                         showFirstLastButtons>
          </mat-paginator>
        </div>

        <mat-progress-bar *ngIf="stockState.isFetchStocks | async" mode="indeterminate"></mat-progress-bar>

        <div *ngIf="(deviceState.isSmallScreen  | async) ===false">
          <table mat-table matSort [dataSource]="stockDatasource">
            <ng-container matColumnDef="select">
              <th mat-header-cell *matHeaderCellDef>
                <mat-checkbox (change)="$event ? masterToggle() : null"
                              [checked]="stockState.selection.hasValue() && isAllSelected()"
                              [indeterminate]="stockState.selection.hasValue() && !isAllSelected()">
                </mat-checkbox>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-checkbox (click)="$event.stopPropagation()"
                              (change)="$event ? stockState.selection.toggle(row) : null"
                              [checked]="stockState.selection.isSelected(row)">
                </mat-checkbox>
              </td>
              <td mat-footer-cell *matFooterCellDef>
                TOTAL
              </td>
            </ng-container>
            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Product</th>
              <td mat-cell *matCellDef="let element">{{element.product}}</td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
              <td mat-cell *matCellDef="let element">
                {{element.stockable ? (element.quantity | number) : 'N/A'}}
              </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="purchase">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Purchase Price</th>
              <td mat-cell *matCellDef="let element">
                {{element.purchasable ? (element.purchase | number) : 'N/A'}}
              </td>
              <td mat-footer-cell *matFooterCellDef="let element">
                {{productValue() | number}}
              </td>
            </ng-container>
            <ng-container matColumnDef="retailPrice">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Sale Pice</th>
              <td matRipple mat-cell *matCellDef="let element">
                {{element.saleable ? (element.retailPrice | number) : 'N/A'}}
              </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="wholesalePrice">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>WholeSale Price</th>
              <td mat-cell *matCellDef="let element">
                {{element.saleable ? (element.wholesalePrice | number) : 'N/A'}}
              </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>
                <div class="d-flex flex-row justify-content-end align-items-end">
                  <span>Actions</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let element">
                <div class="d-flex flex-row flex-nowrap justify-content-end align-items-end">
                  <button [matMenuTriggerFor]="menu" mat-icon-button>
                    <mat-icon color="primary">more_horiz</mat-icon>
                  </button>
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
                </div>
              </td>
              <td mat-footer-cell *matFooterCellDef></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="stockColumns"></tr>
            <tr class="table-data-row" mat-row *matRowDef="let row; columns: stockColumns;"></tr>
            <tr mat-footer-row style="font-size: 36px" *matFooterRowDef="stockColumns"></tr>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="(deviceState.isSmallScreen  | async) ===true">
      <cdk-virtual-scroll-viewport [orientation]="'vertical'" [itemSize]="20" style="min-height: 100vh; width: 100vw">
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
    </div>
  `,
  styleUrls: ['../styles/products.style.scss']
})

export class ProductsTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();
  totalPurchase: Observable<number> = of(0);
  stockDatasource = new MatTableDataSource<StockModel>([]);
  stockColumns = ['select', 'product', 'quantity', 'purchase', 'retailPrice', 'wholesalePrice', 'action'];
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  constructor(private readonly router: Router,
              private readonly indexDb: StorageService,
              public readonly bottomSheet: MatBottomSheet,
              private readonly snack: MatSnackBar,
              private readonly logger: LogService,
              private readonly dialog: MatDialog,
              public readonly deviceState: DeviceState,
              public readonly stockState: StockState) {
  }

  ngOnInit(): void {
    this.stockState.getStocks();
    this.stockState.stocks.pipe(takeUntil(this.onDestroy)).subscribe(stocks => {
      this.stockDatasource.data = stocks;
      this._getTotalPurchaseOfStock(stocks);
    });
  }


  isAllSelected(): boolean {
    if (!this.stockDatasource.data) {
      return false;
    }
    const numSelected = this.stockState.selection.selected.length;
    const numRows = this.stockDatasource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.stockState.selection.clear() :
      this.stockDatasource.data.forEach(row => this.stockState.selection.select(row));
  }

  editStock(element: StockModel): void {
    this.stockState.selectedStock.next(element);
    this.router.navigateByUrl('/stock/products/edit/' + element.id).catch(reason => this.logger.e(reason));
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

  private _getTotalPurchaseOfStock(stocks: StockModel[] = []): void {
    const sum = stocks.map(x => {
      if (x.purchase && x.quantity && x.quantity >= 0 && x.purchasable === true) {
        return x.purchase * x.quantity;
      } else {
        return 0;
      }
    }).reduce((a, b) => a + b, 0);
    this.totalPurchase = of(sum);
  }

  ngOnDestroy(): void {
    this.stockState.stocks.next([]);
    this.onDestroy.next();
  }

  createGroupProduct(): void {
  }

  productValue(): number {
    if (!this.stockDatasource.data) {
      return 0;
    }
    return this.stockState.stocks.value
      .filter(x => x.stockable === true && x.quantity > 0)
      .map(x => x.purchase * x.quantity)
      .reduce((a, b) => a + b, 0);
  }

  ngAfterViewInit(): void {
    this.stockDatasource.paginator = this.paginator;
    this.stockDatasource.sort = this.matSort;
  }

  doneInSubMenu(): void {
    this.stockState.getStocks();
  }
}
