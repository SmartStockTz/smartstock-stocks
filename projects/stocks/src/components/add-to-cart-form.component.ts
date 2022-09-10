import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {CartState} from '../states/cart.state';
import {StockState} from '../states/stock.state';
import {TransferHeader} from '../models/transfer-header';
import {TransferState} from '../states/transfer.state';
import {distinctUntilChanged, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-to-cart-form',
  template: `
    <div class="dialog-container">
      <form class="inputs-container" [formGroup]="addToCartForm" (ngSubmit)="addToCart()">
        <div class="input-container">
          <p class="input-head">Product you transfer to</p>
          <input formControlName="to_product" type="text" class="input-body" [matAutocomplete]="auto">
          <mat-progress-bar *ngIf="(transferState.searchProductProgress | async)===true"
                            mode="indeterminate" color="primary"></mat-progress-bar>
          <mat-autocomplete #auto="matAutocomplete">
            <mat-option *ngFor="let option of transferState.toShopProductResults | async"
                        (onSelectionChange)="selectProduct()"
                        [value]="option.product">
              {{option.product}}
            </mat-option>
          </mat-autocomplete>
        </div>
        <div class="input-container">
          <p class="input-head">Quantities</p>
          <input formControlName="quantity" type="number" class="input-body">
          <mat-error *ngIf="addToCartForm.get('quantity').invalid">
            Quantity required and must be greater that zero
          </mat-error>
        </div>
        <div class="input-container">
          <button color="primary" [disabled]="addToCartForm.invalid"
                  mat-flat-button
                  class="add-button add-button-text">
            Add to cart [ {{addToCartForm.value.quantity * addToCartForm.value.purchase | number}} ]
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../styles/add-to-cart.style.scss']
})

export class AddToCartFormComponent implements OnInit, OnDestroy {
  addToCartForm: UntypedFormGroup;
  @Input() product: StockModel;
  @Input() transferHeader: TransferHeader;
  @Output() done = new EventEmitter();
  selectEvent = false;
  selected;
  private destroyer = new Subject();

  constructor(private readonly cartState: CartState,
              private readonly stockState: StockState,
              private readonly snack: MatSnackBar,
              public readonly transferState: TransferState,
              private readonly formBuilder: UntypedFormBuilder) {
  }

  ngOnInit(): void {
    this.addToCartForm = this.formBuilder.group({
      to_product: ['', [Validators.required, Validators.nullValidator]],
      quantity: [1, [Validators.required, Validators.nullValidator, Validators.min(1)]],
    });
    this.transferState.searchToShopProduct(this.transferHeader, this.product.product);
    this.addToCartForm.get('to_product').valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      takeUntil(this.destroyer)
    ).subscribe({
      next: value => {
        if (this.selectEvent === false) {
          this.transferState.searchToShopProduct(this.transferHeader, value);
        }
        this.selectEvent = false;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  addToCart(): void {
    if (this.addToCartForm.valid) {
      const to_product = this.addToCartForm.value.to_product;
      const quantity = this.addToCartForm.value.quantity;
      const chosen = this.transferState.toShopProductResults.value.filter(x => x.product === to_product);
      if (Array.isArray(chosen) && chosen.length === 1) {
        this.cartState.addToCart({
          from_purchase: this.product.purchase,
          to_purchase: chosen[0].purchase,
          product: this.product.product,
          from_id: this.product.id,
          to_id: chosen[0].id,
          quantity,
          to_retail: chosen[0].retailPrice,
          to_whole: chosen[0].wholesalePrice
        });
        this.stockState.filter('');
        this.done.emit('done');
      } else {
        this.snack.open(to_product +
          ': is not available to shop you transfer to, search again', 'Ok', {
          duration: 2000
        });
      }
    } else {
      this.snack.open('Fill all required fields', 'Ok', {
        duration: 2000
      });
    }
  }

  selectProduct(): void {
    this.selectEvent = true;
  }

  ngOnDestroy(): void {
    this.destroyer.next('done');
  }
}
