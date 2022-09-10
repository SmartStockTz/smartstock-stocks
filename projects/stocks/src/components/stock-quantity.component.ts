import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {getStockQuantity} from '../utils/util';
import {StockService} from '../services/stock.service';

@Component({
  selector: 'app-stock-quantity',
  template: `
    <div class="d-flex-center">
      <span *ngIf="loadQuantity===false && quantityError === false" class="d-flex-center">
        {{stock && stock.stockable ? (quantity | number) : 'N/A'}}
      </span>
      <span *ngIf="loadQuantity===true && quantityError === false" class="d-flex-center">
        Loading...
      </span>
      <a href="#" (click)="refreshQuantity($event)" *ngIf="loadQuantity===false && quantityError === true"
         class="d-flex-center">
        Refresh
      </a>
      <a class="d-flex-center" routerLink="/stock/products/{{stock.id}}/quantity" mat-icon-button>
        <mat-icon class="launch-icon">launch</mat-icon>
      </a>
    </div>
  `,
  styleUrls: ['../styles/stock-quantity.style.scss']
})
export class StockQuantityComponent implements OnInit {
  @Input() stock: StockModel;
  @Output() quantityCallback = new EventEmitter();
  quantity = 0;
  loadQuantity = false;
  quantityError = false;

  constructor() {
  }

  ngOnInit(): void {
    this.fetchQuantity();
  }

  fetchQuantity(): void {
    this.quantity = getStockQuantity(this.stock);
  }

  refreshQuantity($event: MouseEvent): void {
    $event.preventDefault();
    this.fetchQuantity();
  }
}
