import {Component, Input} from '@angular/core';
import {StockModel} from '../models/stock.model';

@Component({
  selector: 'app-stock-quantity-head',
  template: `
    <div class="sqh-container">
      <p class="product-title">Product</p>
      <p class="product-text">{{stock.product}}</p>
      <p class="product-title">Movements</p>
    </div>
  `,
  styleUrls: ['../styles/stock-quantity-head.style.scss']
})

export class StockQuantityTrackingHeadComponent {
  @Input() stock: StockModel;
  constructor() {
  }
}
