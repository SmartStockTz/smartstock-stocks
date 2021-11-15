import {Component, OnDestroy, OnInit} from '@angular/core';
import {StockState} from '../states/stock.state';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {getStockQuantity} from '../utils/stock.util';

@Component({
  selector: 'app-products-value-summary',
  template: `
    <app-dash-card [description]="'non zeros stock values currently'"
                   [title]="'Positive Stock Value'"
                   height=""
                   [content]="content">
      <ng-template #content>
        <div class="summary-container">
          <h1 style="font-size: 34px">
            {{total | number}}
          </h1>
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

  constructor(public readonly stockState: StockState) {
    this.stockState.stocks.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      this.total = value.map(x => {
        const q = getStockQuantity(x);
        if (q > 0) {
          return q * x.purchase;
        } else {
          return 0;
        }
      }).reduce((a, b) => a + b, 0);
    });
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.stockState.getStocks();
  }
}
