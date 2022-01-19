import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StockModel} from '../models/stock.model';
import {StockState} from '../states/stock.state';
import {getStockQuantity} from '../utils/util';

@Component({
  selector: 'app-stock-edit',
  template: `
    <app-stock-new *ngIf="stock" [isLoadingData]="loadStock" [isUpdateMode]="true"
                   [initialStock]="stock"></app-stock-new>
  `,
  styleUrls: ['../styles/edit.style.scss']
})
export class EditPageComponent implements OnInit {

  stock: StockModel;
  loadStock = false;

  constructor(private readonly stockState: StockState,
              private readonly router: Router,
              private readonly activatedRouter: ActivatedRoute,
              private readonly snack: MatSnackBar) {
    document.title = 'SmartStock - Product Edit';
  }

  ngOnInit(): void {
    this.getStock();
  }

  getStock(): void {
    this.loadStock = true;
    this.activatedRouter.params.subscribe({
      next: async value => {
        if (value && value.id) {
          return this.stockState.getStock(value.id).then(value1 => {
            if (value1) {
              value1.quantity = getStockQuantity(value1);
              this.stock = value1;
            } else {
              throw new Error('no product');
            }
          }).catch(_ => {
            // console.log(_);
            this.snack.open('Fails to get stock for update, try again', 'Ok', {
              duration: 3000
            });
            this.router.navigateByUrl('/stock/products').catch();
          }).finally(() => {
            this.loadStock = false;
          });
        } else {
          throw new Error('no id');
        }
      },
      error: error => {
        this.snack.open('Fails to get stock for update, try again', 'Ok', {
          duration: 3000
        });
        this.router.navigateByUrl('/stock/products').catch();
      }
    });
  }
}
