import {Component, Inject, OnInit} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-add-to-cart-sheet',
  template: `
    <app-add-to-cart-form (done)="dialogRef.dismiss($event)" [product]="data"></app-add-to-cart-form>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class AddToCartSheetComponent implements OnInit {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public readonly data: StockModel,
              public readonly dialogRef: MatBottomSheetRef<AddToCartSheetComponent>) {
  }

  ngOnInit(): void {
  }
}
