import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {getStockQuantity} from '../utils/stock.util';

@Component({
  selector: 'app-stock-quantity',
  template: `
    <div class="d-flex-center">
      <span class="d-flex-center">{{stock && stock.stockable ? (quantity | number) : 'N/A'}}</span>
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

  constructor() {
  }

  ngOnInit(): void {
    this.quantity = getStockQuantity(this.stock);
  }
}
