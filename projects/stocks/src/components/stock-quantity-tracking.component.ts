import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {StockModel} from '../models/stock.model';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StockState} from '../states/stock.state';
import {StockService} from '../services/stock.service';

@Component({
  selector: 'app-stock-quantity-tracking',
  template: `
    <div *ngIf="stock" style="margin-bottom: 100px">
      <div *ngIf="loadQuantity === false && quantityError===false">
        <app-stock-quantity-head [stock]="stock"></app-stock-quantity-head>
        <app-stock-quantity-histogram [stock]="stock"></app-stock-quantity-histogram>
        <app-stock-quantity-tracking-table [stock]="stock"></app-stock-quantity-tracking-table>
      </div>
      <span *ngIf="loadQuantity===true && quantityError === false" class="d-flex-center">
        Loading...
      </span>
      <a href="#" (click)="refreshQuantity($event)" *ngIf="loadQuantity===false && quantityError === true"
         class="d-flex-center">
        Refresh
      </a>
    </div>
  `,
  styleUrls: []
})

export class StockQuantityTrackingComponent implements OnInit, OnDestroy {
  stock: StockModel;
  destroyer = new Subject();
  loadQuantity = false;
  quantityError = false;

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly snack: MatSnackBar,
              private readonly stockState: StockState,
              private readonly stockService: StockService,
              private readonly router: Router) {
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroyer)).subscribe(value => {
      const err = () => {
        this.snack.open('Product not exist', 'Ok', {duration: 1000});
        this.router.navigateByUrl('/stock/products').catch(console.log);
      };
      if (value && value.id) {
        this.stockState.getStock(value.id).then(value1 => {
          this.stock = value1;
          this.fetchQuantity();
        }).catch(_ => {
          console.log(_);
          err();
        });
      } else {
        err();
      }
    });
  }

  fetchQuantity(): void {
    this.loadQuantity = true;
    this.quantityError = false;
    this.stockService.getProductQuantityObject(this.stock.id).then(value => {
      this.stock.quantity = value.quantity;
    }).catch(_ => {
      this.quantityError = true;
    }).finally(() => {
      this.loadQuantity = false;
    });
  }

  refreshQuantity($event: MouseEvent): void {
    $event.preventDefault();
    this.fetchQuantity();
  }

}
