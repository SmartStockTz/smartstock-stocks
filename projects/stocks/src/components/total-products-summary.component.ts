import {Component, OnDestroy, OnInit} from '@angular/core';
import {StockState} from '../states/stock.state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-total-products-summary',
  template: `
    <app-dash-card [description]="'number of products you have in stocks'"
                   [title]="'Total Products'"
                   [content]="content">
      <ng-template #content>
        <div
          style="display: flex; height: 100%; flex-direction: column; justify-content: center; align-items: center">
          <h1 style="font-size: 34px">
            {{total | number}}
          </h1>
<!--          <mat-progress-spinner *ngIf="stockState.isFetchStocks.value" mode="indeterminate" diameter="20"-->
<!--                                color="primary"></mat-progress-spinner>-->
        </div>
      </ng-template>
    </app-dash-card>
  `
})
export class TotalProductsSummaryComponent implements OnInit, OnDestroy {
  total = 0;
  destroyer: Subject<any> = new Subject<any>();

  constructor(public readonly stockState: StockState) {
  }

  ngOnInit(): void {
    this.stockState.stocks.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      this.total = value.length;
    });
    this.stockState.getStocks();
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }
}
