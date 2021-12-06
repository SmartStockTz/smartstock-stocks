import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StockModel} from '../models/stock.model';
import {TransferHeader} from '../models/transfer-header';

@Component({
  selector: 'app-add-to-cart-dialog',
  template: `
    <app-add-to-cart-form (done)="dialogRef.close($event)"
                          [transferHeader]="data.header"
                          [product]="data.stock"></app-add-to-cart-form>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class AddToCartDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: {
                stock: StockModel,
                header: TransferHeader
              },
              public readonly dialogRef: MatDialogRef<AddToCartDialogComponent>) {
  }

  ngOnInit(): void {
  }
}
