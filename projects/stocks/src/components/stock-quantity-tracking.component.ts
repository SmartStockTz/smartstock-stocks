import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {StockModel} from '../models/stock.model';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StockState} from '../states/stock.state';

@Component({
  selector: 'app-stock-quantity-tracking',
  template: `
    <div *ngIf="stock" style="margin-bottom: 100px">
      <app-stock-quantity-head [stock]="stock"></app-stock-quantity-head>
      <app-stock-quantity-histogram [stock]="stock"></app-stock-quantity-histogram>
      <app-stock-quantity-tracking-table [stock]="stock"></app-stock-quantity-tracking-table>
    </div>
  `,
  styleUrls: []
})

export class StockQuantityTrackingComponent implements OnInit, OnDestroy {
  stock: StockModel;
  destroyer = new Subject();

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly snack: MatSnackBar,
              private readonly stockState: StockState,
              private readonly router: Router) {
  }

  ngOnDestroy(): void {
    this.destroyer.next();
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroyer)).subscribe(value => {
      const err = () => {
        this.snack.open('Product not exist', 'Ok', {duration: 1000});
        this.router.navigateByUrl('/stock/products').catch(console.log);
      };
      if (value && value.id) {
        this.stockState.getStock(value.id).then(value1 => this.stock = value1).catch(_ => {
          console.log(_);
          err();
        });
      } else {
        err();
      }
    });
  }
}
