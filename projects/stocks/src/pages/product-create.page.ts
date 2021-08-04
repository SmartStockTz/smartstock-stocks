import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {StockModel} from '../models/stock.model';
import {DeviceState, FilesService, UserService} from '@smartstocktz/core-libs';
import {StockService} from '../services/stock.service';
import {MetasModel} from '../models/metas.model';

@Component({
  selector: 'app-stock-new',
  template: `
    <app-layout-sidenav
      [heading]="isUpdateMode?'Update Product':'Create Product'"
      [leftDrawer]="side"
      [body]="body"
      backLink="/stock/products"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      [hasBackRoute]="true"
      [showProgress]="false">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container-fluid stock-new-wrapper">
          <form *ngIf="!isLoadingData" [formGroup]="productForm" #formElement="ngForm"
                (ngSubmit)="isUpdateMode?updateProduct(formElement):addProduct(formElement)">
            <div class="row d-flex justify-content-center align-items-center">
              <div style="margin-bottom: 16px" class="col-12 col-xl-9 col-lg-9 col-md-10 col-sm-12">
                <div class="status-container">
                  <div class="status-item">
                    <div class="status-checker">
                      <mat-checkbox formControlName="saleable" matListIcon></mat-checkbox>
                    </div>
                    <div class="status-text text-wrap">
                      Is this product for sale?
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-checker">
                      <mat-checkbox formControlName="stockable"></mat-checkbox>
                    </div>
                    <div class="status-text">
                      Do you track quantity in stock for this product
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-checker">
                      <mat-checkbox formControlName="purchasable"></mat-checkbox>
                    </div>
                    <div class="status-text">
                      Do you buy this product from external supplier?
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-checker">
                      <mat-checkbox formControlName="canExpire"></mat-checkbox>
                    </div>
                    <div class="status-text">
                      Can this product expire?
                    </div>
                  </div>
                  <div class="status-item">
                    <div class="status-checker">
                      <mat-checkbox formControlName="downloadable"></mat-checkbox>
                    </div>
                    <div class="status-text">
                      Is this a digital product that someone might download it?
                    </div>
                  </div>
                </div>

                <mat-card class="card-wrapper">
                  <img mat-card-image [src]="productForm.value.image" alt="Product Image">
                  <mat-card-actions>
                    <button mat-button (click)="browserMedia($event,'image')" color="primary">
                      Upload image ( optional )
                    </button>
                  </mat-card-actions>
                </mat-card>

                <app-product-short-detail-form
                  [isUpdateMode]="isUpdateMode"
                  [initialStock]="initialStock"
                  [downloadAble]="getDownloadAbleFormControl().value===true"
                  [saleable]="getSaleableFormControl().value === true"
                  [parentForm]="productForm">
                </app-product-short-detail-form>

                <mat-expansion-panel [expanded]="false" style="margin-top: 8px">
                  <mat-expansion-panel-header>
                    <h4 style="margin: 0">Other attributes ( optional ) </h4>
                  </mat-expansion-panel-header>
                  <app-stock-metas-form-field [flat]="true" *ngIf="productForm" [formGroup]="productForm"
                                              [metas]="metasModel"></app-stock-metas-form-field>
                  <div style="height: 24px"></div>
                </mat-expansion-panel>
              </div>
              <div class="col-11 col-xl-9 col-lg-9 col-md-10 col-sm-11" style="padding-bottom: 100px">
                <div>
                  <button class="btn-block ft-button" color="primary" mat-raised-button
                          [disabled]="mainProgress">
                    {{isUpdateMode ? 'Update Product' : 'Create Product'}}
                    <mat-progress-spinner style="display: inline-block" *ngIf="mainProgress" diameter="30"
                                          mode="indeterminate"></mat-progress-spinner>
                  </button>
                  <div style="padding: 16px 0">
                    <button class="btn-block ft-button" routerLink="/stock/products" color="primary" mat-button>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/create.style.scss']
})
export class CreatePageComponent implements OnInit {

  @Input() isUpdateMode = false;
  @Input() initialStock: StockModel;
  @Input() isLoadingData = false;
  metasModel: BehaviorSubject<MetasModel[]> = new BehaviorSubject([]);
  productForm: FormGroup;
  metas: Observable<{
    type: string;
    label: string;
    controlName: string;
  }[]>;
  mainProgress = false;
  uploadTag = '';

  constructor(private readonly formBuilder: FormBuilder,
              private readonly snack: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly router: Router,
              public readonly deviceState: DeviceState,
              public readonly userService: UserService,
              private readonly fileService: FilesService,
              private readonly stockService: StockService) {
    document.title = 'SmartStock - Product Create';
  }

  ngOnInit(): void {
    this.initializeForm(this.initialStock);
    this.metas = of([]);
  }

  initializeForm(stock?: StockModel): void {
    if (stock && stock.metas) {
      this.metasModel.next(Object.keys(stock.metas).map<MetasModel>(x => {
        return {
          name: x,
          value: stock.metas[x],
          type: typeof stock.metas[x]
        };
      }));
    }
    this.productForm = this.formBuilder.group({
      image: [stock && stock.image ? stock.image : ''],
      product: [stock && stock.product ? stock.product : '', [Validators.nullValidator, Validators.required]],
      barcode: [stock && stock.barcode ? stock.barcode : ''],
      saleable: [stock && stock.saleable !== undefined ? stock.saleable : true],
      downloadable: [stock && stock.downloadable !== undefined ? stock.downloadable : false],
      downloads: [stock && stock.downloads ? stock.downloads : []],
      stockable: [stock && stock.stockable !== undefined ? stock.stockable : true],
      purchasable: [stock && stock.purchasable !== undefined ? stock.purchasable : true],
      description: [stock && stock.description ? stock.description : ''],
      purchase: [stock && stock.purchase ? stock.purchase : 0, [Validators.nullValidator, Validators.required]],
      retailPrice: [stock && stock.retailPrice ? stock.retailPrice : 0, [Validators.nullValidator, Validators.required]],
      wholesalePrice: [stock && stock.wholesalePrice ? stock.wholesalePrice : 0, [Validators.nullValidator, Validators.required]],
      wholesaleQuantity: [stock && stock.wholesaleQuantity ? stock.wholesaleQuantity : 1, [Validators.nullValidator, Validators.required]],
      quantity: [stock && stock.quantity ? stock.quantity : 0, [Validators.nullValidator, Validators.required]],
      reorder: [stock && stock.reorder ? stock.reorder : 0, [Validators.nullValidator, Validators.required]],
      unit: [stock && stock.unit ? stock.unit : 'general', [Validators.nullValidator, Validators.required]],
      canExpire: [stock && stock.canExpire !== undefined ? stock.canExpire : false],
      expire: [stock && stock.expire ? stock.expire : null],
      category: [stock && stock.category ? stock.category : 'general', [Validators.required, Validators.nullValidator]],
      catalog: [stock && stock.catalog && Array.isArray(stock.catalog)
        ? stock.catalog
        : ['general'], [Validators.required, Validators.nullValidator]],
      supplier: [stock && stock.supplier ? stock.supplier : 'general', [Validators.required, Validators.nullValidator]],
      metas: stock && stock.metas
        ? this.getMetaFormGroup(stock.metas)
        : this.formBuilder.group({})
    });
  }

  private getMetaFormGroup(metas: { [p: string]: any }): FormGroup {
    const fg = this.formBuilder.group({});
    Object.keys(metas).forEach(key => {
      fg.setControl(key, this.formBuilder.control(metas[key]));
    });
    return fg;
  }

  getSaleableFormControl(): FormControl {
    return this.productForm.get('saleable') as FormControl;
  }

  getPurchasableFormControl(): FormControl {
    return this.productForm.get('purchasable') as FormControl;
  }

  getDownloadAbleFormControl(): FormControl {
    return this.productForm.get('downloadable') as FormControl;
  }

  addProduct(formElement: FormGroupDirective, inUpdateMode = false): void {
    this.productForm.markAsTouched();
    if (!this.productForm.valid) {
      this.snack.open('Fill all required fields', 'Ok', {
        duration: 3000
      });
      return;
    }

    if (this.getPurchasableFormControl().value === true
      && ((this.productForm.value.purchase >= this.productForm.value.retailPrice)
        || (this.productForm.value.purchase >= this.productForm.value.wholesalePrice))) {
      this.snack.open('Purchase price must not be greater than retailPrice/wholesalePrice', 'Ok', {
        duration: 3000
      });
      return;
    }

    if (this.productForm.get('canExpire').value && !this.productForm.get('expire').value) {
      this.snack.open('Please enter expire date', 'Ok', {
        duration: 3000
      });
      return;
    }

    this.mainProgress = true;
    if (inUpdateMode) {
      this.productForm.value.id = this.initialStock.id;
    }
    this.stockService.addStock(this.productForm.value).then(_ => {
      this.mainProgress = false;
      this.snack.open('Product added', 'Ok', {
        duration: 3000
      });
      this.productForm.reset();
      formElement.resetForm();
      this.router.navigateByUrl('/stock/products').catch(console.log);
      // });
    }).catch(reason => {
      this.mainProgress = false;
      this.snack.open(reason.message ? reason.message : 'Unknown', 'Ok', {
        duration: 3000
      });
    });
  }

  updateProduct(formElement: FormGroupDirective): void {
    this.addProduct(formElement, true);
  }

  removeImage(imageInput: HTMLInputElement): void {
    imageInput.value = '';
  }

  async browserMedia($event: MouseEvent, control: string): Promise<void> {
    $event.preventDefault();
    this.fileService.browse().then(value => {
      if (value && value.url) {
        this.productForm.get(control).setValue(value.url);
      } else {
      }
    });
  }
}
