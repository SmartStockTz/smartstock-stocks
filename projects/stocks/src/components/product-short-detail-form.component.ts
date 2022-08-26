import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { StockModel } from '../models/stock.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  DeviceState,
  FileModel,
  FilesService,
  UserService
} from 'smartstock-core';
import { StockService } from '../services/stock.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-short-detail-form',
  template: `
    <div class="stock-new-wrapper">
      <form
        *ngIf="!isLoadingData && productForm"
        [formGroup]="productForm"
        (ngSubmit)="isUpdateMode ? updateProduct() : addProduct()"
      >
        <div class="row d-flex justify-content-center align-items-center">
          <div
            style="margin-bottom: 16px"
            class="col-12 col-xl-9 col-lg-9 col-md-10 col-sm-12"
          >
            <div class="form-field">
              <p class="form-control-title">Name</p>
              <input
                class="form-field-input"
                type="text"
                formControlName="product"
              />
              <mat-hint
                class="hint-text"
                *ngIf="
                  !(
                    productForm.get('product').invalid &&
                    productForm.get('product').touched
                  )
                "
              >
                Enter product name
                <!--                <a href="/help/product#name">more info</a>-->
              </mat-hint>
              <mat-error
                *ngIf="
                  productForm.get('product').invalid &&
                  productForm.get('product').touched
                "
                class="error-text"
              >
                Product name required
              </mat-error>
            </div>
            <div class="form-field">
              <p class="form-control-title">Barcode</p>
              <input
                class="form-field-input"
                type="text"
                formControlName="barcode"
              />
              <mat-hint
                class="hint-text"
                *ngIf="
                  !(
                    productForm.get('barcode').invalid &&
                    productForm.get('barcode').touched
                  )
                "
              >
                Enter barcode
              </mat-hint>
            </div>
<!--            <div class="form-field">-->
<!--              <textarea-->
<!--                class="form-field-input"-->
<!--                placeholder="Description ( Optional )"-->
<!--                type="text"-->
<!--                formControlName="description"-->
<!--              >-->
<!--              </textarea>-->
<!--            </div>-->

            <div class="form-field">
              <p class="form-control-title">
                Images
              </p>
              <app-image-upload
                [initialImages]="productForm.get('images').value"
                (imagesReady)="addImages($event)"
              ></app-image-upload>
            </div>

<!--            <p class="form-control-title">-->
<!--              Product type-->
<!--            </p>-->
<!--            <mat-form-field appearance="outline">-->
<!--              <mat-select formControlName="type" value="simple">-->
<!--                <mat-option value="simple">Simple</mat-option>-->
<!--                <mat-option value="subscription">Subscription</mat-option>-->
<!--              </mat-select>-->
<!--              <mat-error>Product type required</mat-error>-->
<!--              <mat-hint-->
<!--                >Choose type of product-->
<!--                &lt;!&ndash;                <a target="_blank" href="/help/product#type">more info</a>&ndash;&gt;-->
<!--              </mat-hint>-->
<!--            </mat-form-field>-->
<!--            <div-->
<!--              *ngIf="productForm.get('type').value === 'subscription'"-->
<!--              formGroupName="subscription"-->
<!--            >-->
<!--              <div class="form-field">-->
<!--                <input-->
<!--                  min="1"-->
<!--                  formControlName="duration"-->
<!--                  class="form-field-input"-->
<!--                  type="number"-->
<!--                  placeholder="Duration"-->
<!--                />-->
<!--                <mat-hint-->
<!--                  class="hint-text"-->
<!--                  *ngIf="-->
<!--                    !(-->
<!--                      productForm.get('subscription').get('duration').invalid &&-->
<!--                      productForm.get('subscription').get('duration').touched-->
<!--                    )-->
<!--                  "-->
<!--                >-->
<!--                  How many days for subscription to be active-->
<!--                  &lt;!&ndash;                  <a target="_blank" href="/help/product#subscription">more info</a>&ndash;&gt;-->
<!--                </mat-hint>-->
<!--                <mat-error-->
<!--                  *ngIf="-->
<!--                    productForm.get('subscription').get('duration').invalid &&-->
<!--                    productForm.get('subscription').get('duration').touched-->
<!--                  "-->
<!--                  class="error-text"-->
<!--                >-->
<!--                  Subscription duration required-->
<!--                </mat-error>-->
<!--              </div>-->
<!--              <div class="form-field">-->
<!--                <input-->
<!--                  min="0"-->
<!--                  formControlName="grace"-->
<!--                  class="form-field-input"-->
<!--                  type="number"-->
<!--                  placeholder="Grace period"-->
<!--                />-->
<!--                <mat-hint-->
<!--                  class="hint-text"-->
<!--                  *ngIf="-->
<!--                    !(-->
<!--                      productForm.get('subscription').get('grace').invalid &&-->
<!--                      productForm.get('subscription').get('grace').touched-->
<!--                    )-->
<!--                  "-->
<!--                >-->
<!--                  Extra days before subscription expire-->
<!--                  &lt;!&ndash;                  <a target="_blank" href="/help/product#subscription">more info</a>&ndash;&gt;-->
<!--                </mat-hint>-->
<!--                <mat-error-->
<!--                  *ngIf="-->
<!--                    productForm.get('subscription').get('grace').invalid &&-->
<!--                    productForm.get('subscription').get('grace').touched-->
<!--                  "-->
<!--                  class="error-text"-->
<!--                >-->
<!--                  Grace period required-->
<!--                </mat-error>-->
<!--              </div>-->
<!--            </div>-->
            <div class="form-field">
              <app-category-form-field
                [formGroup]="productForm"
              ></app-category-form-field>
            </div>

<!--            <div class="status-item">-->
<!--              <div class="status-text text-wrap">-->
<!--                Is this product for sale?-->
<!--              </div>-->
<!--              <div class="status-checker">-->
<!--                <span>{{-->
<!--                  productForm.get("saleable").value === true ? "YES" : "NO"-->
<!--                }}</span>-->
<!--                <mat-slide-toggle formControlName="saleable"></mat-slide-toggle>-->
<!--              </div>-->
<!--            </div>-->

            <div
              class="form-field"
            >
              <p class="form-control-title">Retail price</p>
              <input
                class="form-field-input"
                min="0"
                type="number"
                formControlName="retailPrice"
              />
              <mat-hint
                class="hint-text"
                *ngIf="
                  !(
                    productForm.get('retailPrice').invalid &&
                    productForm.get('retailPrice').touched
                  )
                "
              >
                Enter product retail price
                <!--                <a href="/help/product#price">more info</a>-->
              </mat-hint>
              <mat-error
                *ngIf="
                  productForm.get('retailPrice').invalid &&
                  productForm.get('retailPrice').touched
                "
                class="error-text"
              >
                Retail price required
              </mat-error>
            </div>

            <div
              *ngIf="productForm.get('saleable').value === true"
              class="form-field"
            >
              <p class="form-control-title">Wholesale price</p>
              <input
                class="form-field-input"
                min="0"
                type="number"
                formControlName="wholesalePrice"
              />
              <mat-hint
                class="hint-text"
                *ngIf="
                  !(
                    productForm.get('wholesalePrice').invalid &&
                    productForm.get('wholesalePrice').touched
                  )
                "
              >
                Enter product wholesale price
                <!--                <a href="/help/product#price">more info</a>-->
              </mat-hint>
              <mat-error
                *ngIf="
                  productForm.get('wholesalePrice').invalid &&
                  productForm.get('wholesalePrice').touched
                "
                class="error-text"
              >
                Wholesale price required
              </mat-error>
            </div>

            <div
              *ngIf="productForm.get('saleable').value === true"
              class="form-field"
            >
<!--              <p class="form-control-title">Wholesale quantity</p>-->
<!--              <input-->
<!--                class="form-field-input"-->
<!--                min="0"-->
<!--                type="number"-->
<!--                formControlName="wholesaleQuantity"-->
<!--              />-->
<!--              <mat-hint-->
<!--                class="hint-text"-->
<!--                *ngIf="-->
<!--                  !(-->
<!--                    productForm.get('wholesaleQuantity').invalid &&-->
<!--                    productForm.get('wholesaleQuantity').touched-->
<!--                  )-->
<!--                "-->
<!--              >-->
<!--                How many unity quantity correspond to wholesale price-->
<!--                &lt;!&ndash;                <a href="/help/product#price">more info</a>&ndash;&gt;-->
<!--              </mat-hint>-->
              <mat-error
                *ngIf="
                  productForm.get('wholesaleQuantity').invalid &&
                  productForm.get('wholesaleQuantity').touched
                "
                class="error-text"
              >
                Wholesale quantity required
              </mat-error>
            </div>

<!--            <div class="status-item">-->
<!--              <div class="status-text">-->
<!--                Is this a digital product that someone might download it?-->
<!--              </div>-->
<!--              <div class="status-checker">-->
<!--                <span>{{-->
<!--                  productForm.get("downloadable").value === true ? "YES" : "NO"-->
<!--                }}</span>-->
<!--                <mat-slide-toggle-->
<!--                  formControlName="downloadable"-->
<!--                ></mat-slide-toggle>-->
<!--              </div>-->
<!--            </div>-->

<!--            <div-->
<!--              *ngIf="productForm.get('downloadable').value === true"-->
<!--              class="card-wrapper"-->
<!--            >-->
<!--              <p class="form-control-title">Downloadable items</p>-->
<!--              <app-stock-downloadable-->
<!--                (filesReady)="addFiles($event)"-->
<!--                [files]="isUpdateMode ? initialStock.downloads : []"-->
<!--              >-->
<!--              </app-stock-downloadable>-->
<!--            </div>-->

<!--            <div class="status-item">-->
<!--              <div class="status-text">-->
<!--                Do you buy this product from external supplier?-->
<!--              </div>-->
<!--              <div class="status-checker">-->
<!--                <span>{{-->
<!--                  productForm.get("purchasable").value === true ? "YES" : "NO"-->
<!--                }}</span>-->
<!--                <mat-slide-toggle-->
<!--                  formControlName="purchasable"-->
<!--                ></mat-slide-toggle>-->
<!--              </div>-->
<!--            </div>-->

            <app-suppliers-form-field
              [formGroup]="productForm"
              [purchasable]="true"
            >
            </app-suppliers-form-field>

            <div
              *ngIf="productForm.get('purchasable').value === true"
              class="form-field"
            >
              <p class="form-control-title">Purchase Price</p>
              <input
                class="form-field-input"
                min="0"
                type="number"
                formControlName="purchase"
              />
              <mat-hint
                class="hint-text"
                *ngIf="
                  !(
                    productForm.get('purchase').invalid &&
                    productForm.get('purchase').touched
                  )
                "
              >
                Enter product purchase price per unit quantity
                <!--                <a href="/help/product#purchase">more info</a>-->
              </mat-hint>
              <mat-error
                *ngIf="
                  productForm.get('purchase').invalid &&
                  productForm.get('purchase').touched
                "
                class="error-text"
              >
                Purchase price required
              </mat-error>
            </div>

<!--            <div-->
<!--              *ngIf="productForm.get('purchasable').value === true"-->
<!--              class="form-field"-->
<!--            >-->
<!--              <p class="form-control-title">Reorder Level</p>-->
<!--              <input-->
<!--                class="form-field-input"-->
<!--                min="0"-->
<!--                matInput-->
<!--                type="number"-->
<!--                formControlName="reorder"-->
<!--              />-->
<!--              <mat-hint-->
<!--                class="hint-text"-->
<!--                *ngIf="-->
<!--                  !(-->
<!--                    productForm.get('reorder').invalid &&-->
<!--                    productForm.get('reorder').touched-->
<!--                  )-->
<!--                "-->
<!--              >-->
<!--                Minimum quantity for reorder notification-->
<!--                &lt;!&ndash;                <a href="/help/product#purchase">more info</a>&ndash;&gt;-->
<!--              </mat-hint>-->
<!--              <mat-error-->
<!--                *ngIf="-->
<!--                  productForm.get('reorder').invalid &&-->
<!--                  productForm.get('reorder').touched-->
<!--                "-->
<!--                class="error-text"-->
<!--              >-->
<!--                Reorder level quantity required-->
<!--              </mat-error>-->
<!--            </div>-->

<!--            <div class="status-item">-->
<!--              <div class="status-text">-->
<!--                Do you track quantity for this product?-->
<!--              </div>-->
<!--              <div class="status-checker">-->
<!--                <span>{{-->
<!--                  productForm.get("stockable").value === true ? "YES" : "NO"-->
<!--                }}</span>-->
<!--                <mat-slide-toggle-->
<!--                  formControlName="stockable"-->
<!--                ></mat-slide-toggle>-->
<!--              </div>-->
<!--            </div>-->

<!--            <app-units-form-field-->
<!--              [stockable]="true"-->
<!--              [formGroup]="productForm"-->
<!--            >-->
<!--            </app-units-form-field>-->

            <div
              *ngIf="productForm.get('stockable').value === true"
              class="form-field"
            >
              <p class="form-control-title">Current Quantity</p>
              <input
                class="form-field-input"
                min="0"
                matInput
                type="number"
                formControlName="quantity"
              />
              <mat-hint
                class="hint-text"
                *ngIf="
                  !(
                    productForm.get('quantity').invalid &&
                    productForm.get('quantity').touched
                  )
                "
              >
                Current unit quantity for this product
                <!--                <a href="/help/product#stock">more info</a>-->
              </mat-hint>
              <mat-error
                *ngIf="
                  productForm.get('quantity').invalid &&
                  productForm.get('quantity').touched
                "
                class="error-text"
              >
                Quantity required
              </mat-error>
            </div>

<!--            <div class="status-item">-->
<!--              <div class="status-text">-->
<!--                Can this product expire?-->
<!--              </div>-->
<!--              <div class="status-checker">-->
<!--                <span>{{-->
<!--                  productForm.get("canExpire").value === true ? "YES" : "NO"-->
<!--                }}</span>-->
<!--                <mat-slide-toggle-->
<!--                  formControlName="canExpire"-->
<!--                ></mat-slide-toggle>-->
<!--              </div>-->
<!--            </div>-->

            <mat-form-field
              appearance="outline"
              class="full-width"
            >
              <mat-label>Expire Date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                formControlName="expire"
              />
              <mat-datepicker-toggle
                matSuffix
                [for]="picker"
              ></mat-datepicker-toggle>
              <mat-datepicker [touchUi]="true" #picker></mat-datepicker>
            </mat-form-field>
          </div>
          <div
            class="col-11 col-xl-9 col-lg-9 col-md-10 col-sm-11"
            style="padding-bottom: 100px"
          >
            <div>
              <button
                class="btn-block ft-button"
                color="primary"
                mat-raised-button
                [disabled]="mainProgress"
              >
                {{ isUpdateMode ? "Update Product" : "Create Product" }}
                <mat-progress-spinner
                  style="display: inline-block"
                  *ngIf="mainProgress"
                  diameter="30"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </button>
              <div style="padding: 16px 0">
                <button
                  class="btn-block ft-button"
                  routerLink="/stock/products"
                  color="primary"
                  mat-button
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['../styles/create.style.scss']
})
export class ProductShortDetailFormComponent implements OnInit, OnDestroy {
  @Input() isUpdateMode = false;
  @Input() initialStock: StockModel;
  productForm: UntypedFormGroup;
  isLoadingData = false;
  mainProgress = false;
  destroy = new Subject();

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly snack: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    public readonly deviceState: DeviceState,
    public readonly userService: UserService,
    private readonly fileService: FilesService,
    private readonly stockService: StockService
  ) {}

  ngOnInit(): void {
    this.initializeForm(this.initialStock);
  }

  initializeForm(stock?: StockModel): void {
    this.productForm = this.formBuilder.group({
      barcode: [stock && stock.barcode ? stock.barcode : ''],
      images: [stock?.images],
      product: [
        stock?.product,
        [Validators.nullValidator, Validators.required]
      ],
      saleable: [stock && stock.saleable !== undefined ? stock.saleable : true],
      stockable: [
        stock && stock.stockable !== undefined ? stock.stockable : true
      ],
      purchasable: [
        stock && stock.purchasable !== undefined ? stock.purchasable : true
      ],
      purchase: [
        stock?.purchase,
        [this.purchaseValidator()]
      ],
      retailPrice: [
        stock?.retailPrice,
        [this.priceValidator()]
      ],
      wholesalePrice: [
        stock?.wholesalePrice,
        [this.priceValidator()]
      ],
      wholesaleQuantity: [
        stock && stock.wholesaleQuantity ? stock.wholesaleQuantity : 1,
        []
      ],
      quantity: [
        stock?.quantity,
        [this.stockValidator()]
      ],
      expire: [stock?.expire],
      category: [
        stock?.category,
        [Validators.required, Validators.nullValidator]
      ],
      supplier: [
        stock?.supplier,
        [this.supplierValidator()]
      ]
    });
    this.productForm
      .get('saleable')
      .valueChanges.pipe(takeUntil(this.destroy))
      .subscribe((value) => {
        if (value === false) {
          this.productForm.get('retailPrice').updateValueAndValidity();
          this.productForm.get('wholesalePrice').updateValueAndValidity();
          this.productForm.get('wholesaleQuantity').updateValueAndValidity();
        }
      });
    this.productForm
      .get('purchasable')
      .valueChanges.pipe(takeUntil(this.destroy))
      .subscribe((value) => {
        if (value === false) {
          this.productForm.get('purchase').updateValueAndValidity();
          this.productForm.get('supplier').updateValueAndValidity();
          this.productForm.get('reorder').updateValueAndValidity();
        }
      });
    this.productForm
      .get('stockable')
      .valueChanges.pipe(takeUntil(this.destroy))
      .subscribe((value) => {
        if (value === false) {
          this.productForm.get('quantity').updateValueAndValidity();
          this.productForm.get('unit').updateValueAndValidity();
        }
      });
  }

  addProduct(inUpdateMode = false): void {
    this.productForm.updateValueAndValidity();
    this.productForm.markAllAsTouched();
    if (!this.productForm.valid) {
      this.snack.open('Fill all required fields', 'Ok', {
        duration: 3000
      });
      return;
    }
    if (
      this.getPurchasableFormControl().value === true &&
      (this.productForm.value.purchase >= this.productForm.value.retailPrice ||
        this.productForm.value.purchase >=
          this.productForm.value.wholesalePrice)
    ) {
      this.snack.open(
        'Purchase price must not be greater than retailPrice/wholesalePrice',
        'Ok',
        {
          duration: 3000
        }
      );
      return;
    }

    // if (
    //   this.productForm.get('canExpire').value &&
    //   !this.productForm.get('expire').value
    // ) {
    //   this.snack.open('Please enter expire date', 'Ok', {
    //     duration: 3000
    //   });
    //   return;
    // }

    this.mainProgress = true;
    if (inUpdateMode) {
      this.productForm.value.id = this.initialStock.id;
    }
    this.stockService
      .addStock(this.productForm.value)
      .then((_) => {
        this.mainProgress = false;
        this.snack.open('Product added', 'Ok', {
          duration: 3000
        });
        this.productForm.reset();
        // formElement.resetForm();
        this.router.navigateByUrl('/stock/products').catch(console.log);
        // });
      })
      .catch((reason) => {
        this.mainProgress = false;
        this.snack.open(reason.message ? reason.message : 'Unknown', 'Ok', {
          duration: 3000
        });
      });
  }

  updateProduct(): void {
    this.addProduct(true);
  }

  addImages(images: string[]): void {
    this.productForm.get('images').setValue(images);
  }

  getPurchasableFormControl(): UntypedFormControl {
    return this.productForm.get('purchasable') as UntypedFormControl;
  }

  addFiles($event: FileModel[]): void {
    this.productForm.get('downloads').setValue($event);
  }

  priceValidator(): ValidatorFn {
    const message = { message: 'error' };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const saleable = control?.parent?.get('saleable')?.value;
      if (!!saleable === false) {
        return null;
      }
      if (parseInt(control.value, 10) > -1) {
        return null;
      }
      // if (isNaN(value)) {
      //   return message;
      // }
      return message;
      //   })
      // );
    };
  }

  purchaseValidator(): ValidatorFn {
    const message = { message: true };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const purchasable = control?.parent?.get('purchasable')?.value;
      if (purchasable === false) {
        return null;
      }
      // console.log(control.value, 'P VALUE');
      // console.log(parseInt(control.value, 10) > -1, 'THE EVALUATION FUCK');
      if (parseInt(control.value, 10) > -1) {
        return null;
      }
      // if (isNaN(value)) {
      //   return message;
      // }
      return message;
      //   })
      // );
    };
  }

  supplierValidator(): ValidatorFn {
    const message = { message: true };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const purchasable = control?.parent?.get('purchasable')?.value;
      // console.log(purchasable, 'PURCHASABLE');
      if (purchasable === false) {
        return null;
      }
      // console.log(control.value, 'P VALUE');
      // console.log(parseInt(control.value, 10) > -1, 'THE EVALUATION FUCK');
      if (control.value) {
        return null;
      }
      // if (isNaN(value)) {
      //   return message;
      // }
      return message;
      //   })
      // );
    };
  }

  stockValidator(): ValidatorFn {
    const message = { message: 'error' };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const stockable = control?.parent?.get('stockable')?.value;
      if (!!stockable === false) {
        return null;
      }
      if (parseInt(control.value, 10) > -1) {
        return null;
      }
      // if (isNaN(value)) {
      //   return message;
      // }
      return message;
      //   })
      // );
    };
  }

  unitValidator(): ValidatorFn {
    const message = { message: 'error' };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const stockable = control?.parent?.get('stockable')?.value;
      if (stockable === false) {
        return null;
      }
      if (control.value) {
        return null;
      }
      // if (isNaN(value)) {
      //   return message;
      // }
      return message;
      //   })
      // );
    };
  }

  durationValidator(): ValidatorFn {
    const message = { message: 'error' };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const type = control?.parent?.parent?.get('type')?.value;
      if (type === 'subscription') {
        if (parseInt(control.value, 10) > 0) {
          return null;
        }
        // if (isNaN(value)) {
        //   return message;
        // }
        return message;
      } else {
        return null;
      }
      //   })
      // );
    };
  }

  graceValidator(): ValidatorFn {
    const message = { message: 'error' };
    return (control: AbstractControl): ValidationErrors | null => {
      // return of(control.value).pipe(
      //   map(value => {
      const type = control?.parent?.parent?.get('type')?.value;
      // console.log(type);
      if (type === 'subscription') {
        if (parseInt(control.value, 10) > -1) {
          return null;
        }
        // if (isNaN(value)) {
        //   return message;
        // }
        return message;
      } else {
        return null;
      }
      //   })
      // );
    };
  }

  ngOnDestroy(): void {
    this.destroy.next('done');
  }
}
