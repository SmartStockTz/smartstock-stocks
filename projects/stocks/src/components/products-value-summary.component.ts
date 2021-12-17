import {Component, OnDestroy, OnInit} from '@angular/core';
import {StockState} from '../states/stock.state';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-products-value-summary',
  template: `
    <app-dash-card [description]="'non zeros stock values currently'"
                   [title]="'Positive Stock Value'"
                   height=""
                   [content]="content">
      <ng-template #content>
        <div class="summary-container">
          <h1 *ngIf="totalLoad===false" style="font-size: 34px">
            {{total | number}}
          </h1>
          <button (click)="refresh()" *ngIf="totalLoad===false" mat-button>Refresh</button>
          <mat-progress-spinner *ngIf="totalLoad === true" diameter="30"
                                color="primary" mode="indeterminate"
                                style="display: inline-block">
          </mat-progress-spinner>
        </div>
      </ng-template>
    </app-dash-card>
  `,
  styleUrls: ['../styles/index.style.scss']
})
export class ProductsValueSummaryComponent implements OnInit, OnDestroy {
  totalLoad = false;
  total = 0;
  destroyer: Subject<any> = new Subject<any>();

  constructor(public readonly stockState: StockState,
              private readonly snack: MatSnackBar) {
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.stockState.getStocks();
    this.refresh();
  }

  refresh(): void {
    this.totalLoad = true;
    this.stockState.positiveStockValue().then(value => {
      this.total = value;
    }).catch(reason => {
      this.snack.open(reason && reason.message ? reason.message : reason.toString());
    }).finally(() => {
      this.totalLoad = false;
    });
  }
}
