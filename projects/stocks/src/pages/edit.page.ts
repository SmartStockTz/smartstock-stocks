import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StockModel} from '../models/stock.model';
import {StockState} from '../states/stock.state';

@Component({
  selector: 'app-stock-edit',
  template: `
    <app-stock-new [isLoadingData]="loadStock" [isUpdateMode]="true"
                   [initialStock]="stock"></app-stock-new>
  `,
  styleUrls: ['../styles/edit.style.scss']
})
export class EditPageComponent implements OnInit {

  stock: StockModel;
  loadStock = false;

  constructor(private readonly stockState: StockState,
              private readonly router: Router,
              private readonly snack: MatSnackBar) {
    document.title = 'SmartStock - Product Edit';
  }

  ngOnInit(): void {
    this.getStock();
  }

  getStock(): void {
    this.loadStock = true;
    if (this.stockState.selectedStock.value) {
      this.stock = this.stockState.selectedStock.value;
    } else {
      this.snack.open('Fails to get stock for update', 'Ok', {
        duration: 3000
      });
      this.router.navigateByUrl('/stock').catch();
    }
    this.loadStock = false;
  }
}