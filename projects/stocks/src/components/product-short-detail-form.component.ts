import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {StockModel} from '../models/stock.model';

@Component({
  selector: 'app-product-short-detail-form',
  template: `
    <form [formGroup]="parentForm">
      <div class="form-field">
        <input placeholder="Name" class="form-field-input" type="text" formControlName="product">
        <mat-hint class="hint-text" *ngIf="!(parentForm.get('product').invalid && parentForm.get('product').dirty)">
          Enter product name <a href="/help/product#name">more info</a>
        </mat-hint>
        <mat-error *ngIf="parentForm.get('product').invalid && parentForm.get('product').dirty" class="error-text">
          Product name required
        </mat-error>
      </div>
      <mat-form-field appearance="fill" class="my-input">
        <mat-label>Description ( optional )</mat-label>
        <textarea placeholder="optional" matInput type="text" formControlName="description"></textarea>
      </mat-form-field>
      <mat-form-field appearance="fill" class="my-input">
        <mat-label>Barcode ( optional )</mat-label>
        <input matInput type="text" formControlName="barcode">
        <!--            <mat-error>barcode required</mat-error>-->
      </mat-form-field>
      <mat-form-field *ngIf="saleable === true" appearance="fill" class="my-input">
        <mat-label>Retail price</mat-label>
        <span matSuffix>TZS</span>
        <input min="0" matInput type="number" formControlName="retailPrice">
        <mat-error>Retail price required</mat-error>
        <!--            <mat-hint>enter price per unit quantity when sale in retail</mat-hint>-->
      </mat-form-field>
      <mat-form-field appearance="fill" class="my-input">
        <mat-label>Wholesale price</mat-label>
        <span matSuffix>TZS</span>
        <input min="0" matInput type="number" formControlName="wholesalePrice">
        <mat-error>Wholesale price required</mat-error>
        <!--            <mat-hint>enter price for wholesale ( same as retail if you don't have wholesale )</mat-hint>-->
      </mat-form-field>
      <mat-form-field appearance="fill" class="my-input">
        <mat-label>Wholesale quantity</mat-label>
        <input min="0" matInput type="number" formControlName="wholesaleQuantity">
        <!--            <mat-icon matSuffix>info</mat-icon>-->
        <mat-error>Wholesale quantity required</mat-error>
        <!--            <mat-hint>-->
        <!--              how many unit quantity will be reduce from stock if this item sold in wholesale? ( put 1 if you don't have wholesale )-->
        <!--            </mat-hint>-->
      </mat-form-field>
      <!--          <app-catalog-form-field [formGroup]="parentForm"></app-catalog-form-field>-->
      <!--          <div class="d-flex align-items-center">-->
      <!--            <mat-checkbox style="margin-right: 5px" formControlName="downloadable"></mat-checkbox>-->
      <!--            <p style="margin: 0">Can be downloaded</p>-->
      <!--          </div>-->
      <div *ngIf="downloadAble" class="card-wrapper">
        <app-stock-downloadable [files]="isUpdateMode?initialStock.downloads:[]">
        </app-stock-downloadable>
      </div>

      <mat-form-field *ngIf="getPurchasableFormControl().value === true" appearance="fill"
                      class="my-input">
        <mat-label>Purchase Price / Unit</mat-label>
        <span matSuffix>TZS</span>
        <input min="0" matInput type="number" required formControlName="purchase">
        <mat-error>Purchase price required</mat-error>
      </mat-form-field>
      <mat-form-field *ngIf="getStockableFormControl().value === true" appearance="fill"
                      class="my-input"
                      matTooltip="Total initial unit quantity available">
        <mat-label>Initial Stock Quantity</mat-label>
        <input min="0" matInput type="number" required
               formControlName="quantity">
        <mat-error>Initial Stock Quantity required</mat-error>
      </mat-form-field>
      <mat-form-field *ngIf="getStockableFormControl().value === true" appearance="fill"
                      class="my-input">
        <mat-label>Reorder Level</mat-label>
        <input min="0" matInput type="number" required formControlName="reorder">
        <mat-error>Reorder field required</mat-error>
      </mat-form-field>
      <app-suppliers-form-field [formGroup]="parentForm"
                                [purchasable]="getPurchasableFormControl().value===true">
      </app-suppliers-form-field>
      <app-units-form-field [stockable]="getStockableFormControl().value === true"
                            [formGroup]="parentForm">
      </app-units-form-field>
      <mat-form-field *ngIf="getCanExpireFormControl().value === true" appearance="outline"
                      class="my-input">
        <mat-label>Expire Date</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="expire">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker [touchUi]="true" #picker></mat-datepicker>
      </mat-form-field>
    </form>
  `,
  styleUrls: ['../styles/create.style.scss']
})
export class ProductShortDetailFormComponent implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() saleable = true;
  @Input() downloadAble = false;
  @Input() isUpdateMode = false;
  @Input() initialStock: StockModel;

  constructor() {
  }

  ngOnInit(): void {
  }

  downloadsFormControl(): FormControl {
    return this.parentForm.get('downloads') as FormControl;
  }

  getDownloadsFormControl(): FormControl {
    return this.parentForm.get('downloads') as FormControl;
  }

  getCanExpireFormControl(): FormControl {
    return this.parentForm.get('canExpire') as FormControl;
  }

  getStockableFormControl(): FormControl {
    return this.parentForm.get('stockable') as FormControl;
  }

  getPurchasableFormControl(): FormControl {
    return this.parentForm.get('purchasable') as FormControl;
  }

}
