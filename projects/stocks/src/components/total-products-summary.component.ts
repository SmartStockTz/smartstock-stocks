import {Component, OnDestroy, OnInit} from '@angular/core';
import {StockState} from '../states/stock.state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-total-products-summary',
  template: `
    <app-dash-card [description]="'number of products you have in stocks'"
                   [title]="'Positive Products'"
                   height="200"
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
export class TotalProductsSummaryComponent implements OnInit, OnDestroy {
  totalLoad = false;
  total = 0;
  destroyer: Subject<any> = new Subject<any>();

  constructor(public readonly stockState: StockState,
    public readonly snack: MatSnackBar) {
  }

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  refresh(): void {
    this.totalLoad = true;
    this.stockState.positiveStockItems().then(value => {
      this.total = value;
    }).catch(reason => {
      this.snack.open(reason && reason.message ? reason.message : reason.toString(),'OK',{duration:2000});
    }).finally(() => {
      this.totalLoad = false;
    });
  }
}
