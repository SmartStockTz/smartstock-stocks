import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, FormGroup, Validators} from '@angular/forms';
import {TransferState} from '../states/transfer.state';
import {MessageService, UserService} from 'smartstock-core';
import {ShopModel} from '../models/shop.model';
import {MatDialog} from '@angular/material/dialog';
import {ProductSearchDialogComponent} from './product-search-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {StockModel} from '../models/stock.model';
import {InfoDialogComponent} from './info-dialog.component';

@Component({
  selector: 'app-stock-transfer-create-form',
  template: `
    <div class="">
<!--      <form *ngIf="transferFormGroup" [formGroup]="transferFormGroup" (ngSubmit)="saveTransfer()">-->

<!--        <h1 style="margin-top: 16px">Products</h1>-->
<!--        <div style="margin-bottom: 16px; display: flex; flex-direction: row; flex-wrap: wrap">-->
<!--          <button [disabled]="(transferState.isSaveTransfers | async) === true"-->
<!--                  (click)="addProductToTable($event)"-->
<!--                  mat-button color="primary">-->
<!--            <mat-icon matSuffix>add</mat-icon>-->
<!--            Add Product-->
<!--          </button>-->
<!--          <div style="width: 16px; height: 16px"></div>-->
<!--          <button [disabled]="(transferState.isSaveTransfers | async) === true" mat-flat-button color="primary">-->
<!--            <mat-icon matSuffix>done_all</mat-icon>-->
<!--            Submit-->
<!--            <mat-progress-spinner mode="indeterminate" diameter="20" style="display: inline-block"-->
<!--                                  *ngIf="(transferState.isSaveTransfers | async) === true"-->
<!--                                  color="primary"></mat-progress-spinner>-->
<!--          </button>-->
<!--        </div>-->
<!--        <mat-card>-->
<!--          <table mat-table [dataSource]="transfersDatasource">-->
<!--            <ng-container cdkColumnDef="product">-->
<!--              <th mat-header-cell *cdkHeaderCellDef>Product</th>-->
<!--              <td mat-cell *cdkCellDef="let element">{{element.product.product}}</td>-->
<!--              <td mat-footer-cell *cdkFooterCellDef>-->
<!--                <h2 style="margin: 0; padding: 5px">TOTAL</h2>-->
<!--              </td>-->
<!--            </ng-container>-->
<!--            <ng-container cdkColumnDef="quantity">-->
<!--              <th mat-header-cell *cdkHeaderCellDef>Quantity</th>-->
<!--              <td mat-cell *cdkCellDef="let element">-->
<!--                &lt;!&ndash;                <button mat-icon-button (click)="">&ndash;&gt;-->
<!--                &lt;!&ndash;                  <mat-icon>remove</mat-icon>&ndash;&gt;-->
<!--                &lt;!&ndash;                </button>&ndash;&gt;-->
<!--                <input class="quantity-input" (change)="updateQuantity(element, $event)" type="number" min="1"-->
<!--                       [value]="element.quantity">-->
<!--                &lt;!&ndash;                <button mat-icon-button>&ndash;&gt;-->
<!--                &lt;!&ndash;                  <mat-icon>add</mat-icon>&ndash;&gt;-->
<!--                &lt;!&ndash;                </button>&ndash;&gt;-->
<!--              </td>-->
<!--              <td mat-footer-cell *cdkFooterCellDef>-->
<!--              </td>-->
<!--            </ng-container>-->
<!--            <ng-container cdkColumnDef="subAmount">-->
<!--              <th mat-header-cell *cdkHeaderCellDef>Sub Amount</th>-->
<!--              <td mat-cell *cdkCellDef="let element">{{(element.quantity * element.product.purchase) | number}}</td>-->
<!--              <td mat-footer-cell *cdkFooterCellDef>-->
<!--                <h1 style="margin: 0; padding: 5px">{{totalCost | number}}</h1>-->
<!--              </td>-->
<!--            </ng-container>-->
<!--            <ng-container cdkColumnDef="action">-->
<!--              <th mat-header-cell *cdkHeaderCellDef>Action</th>-->
<!--              <td mat-cell *cdkCellDef="let element">-->
<!--                <button (click)="removeItem($event, element)" mat-icon-button color="warn">-->
<!--                  <mat-icon>delete</mat-icon>-->
<!--                </button>-->
<!--              </td>-->
<!--              <td mat-footer-cell *cdkFooterCellDef>-->
<!--              </td>-->
<!--            </ng-container>-->
<!--            <tr mat-header-row *cdkHeaderRowDef="transfersTableColumn"></tr>-->
<!--            <tr mat-row *matRowDef="let row; columns transfersTableColumn"></tr>-->
<!--            <tr mat-footer-row *cdkFooterRowDef="transfersTableColumn"></tr>-->
<!--          </table>-->
<!--        </mat-card>-->
<!--      </form>-->
    </div>
  `,
  styleUrls: ['../styles/transfer-create-form.style.scss']
})
export class TransferCreateFormComponent implements OnInit {
  // transferFormGroup: FormGroup;
  shops: ShopModel[] = [];
  transfersDatasource: MatTableDataSource<{ quantity: number, product: StockModel }> = new MatTableDataSource([]);
  transfersTableColumn = ['product', 'quantity', 'subAmount', 'action'];
  selectedProducts: { quantity: number, product: StockModel }[] = [];
  totalCost = 0;

  constructor(private readonly formBuilder: UntypedFormBuilder,
              private readonly message: MessageService,
              private readonly userService: UserService,
              private readonly dialog: MatDialog,
              public readonly transferState: TransferState) {
  }

  ngOnInit(): void {
    // this.transferFormGroup = this.formBuilder.group({
    //   from_shop: [null, [Validators.required, Validators.nullValidator]],
    //   transferred_by: [null, [Validators.required, Validators.nullValidator]],
    //   amount: [null, [Validators.required, Validators.nullValidator]],
    //   items: [[], [Validators.required, Validators.nullValidator]]
    // });
  }

  updateTotalCost(): void {
    this.totalCost = this.transfersDatasource.data
      .map(x => x.quantity * x.product.purchase)
      .reduce((a, b) => a + b, 0);
  }

  async saveTransfer(): Promise<void> {
    if (this.transfersDatasource.data && this.transfersDatasource.data.filter(x => x.quantity <= 0).length > 0) {
      this.message.showMobileInfoMessage(
        'Products quantity must be positive and greater than zero',
        3000,
        'bottom'
      );
      return;
    }
    const currentShop = await this.userService.getCurrentShop();
    const user = await this.userService.currentUser();
    // if (this.transferFormGroup.value.to_shop) {
    //   this.transferFormGroup.get('to_shop').setValue({
    //     projectId: this.transferFormGroup.value.to_shop.projectId,
    //     name: this.transferFormGroup.value.to_shop.name,
    //     applicationId: this.transferFormGroup.value.to_shop.applicationId
    //   });
    // }
    // this.transferFormGroup.get('amount').setValue(this.totalCost);
    // this.transferFormGroup.get('from_shop').setValue({
    //   projectId: currentShop.projectId,
    //   name: currentShop.name,
    //   applicationId: currentShop.applicationId
    // });
    // this.transferFormGroup.get('transferred_by').setValue({
    //   username: user.username,
    //   email: user.email,
    //   mobile: user.mobile,
    //   id: user.id,
    //   firstname: user.firstname,
    //   lastname: user.lastname,
    // });
    // this.transferFormGroup.get('items').setValue(this.transfersDatasource.data);
    // if (this.transferFormGroup.valid) {
    //   this.dialog.open(InfoDialogComponent, {
    //     data: {
    //       message: 'When you submit a transfer will be saved ' +
    //         'and corresponding stocks will be updated and you will not be able to edit it again.'
    //     }
    //   }).afterClosed().subscribe(value => {
    //     if (value === true) {
    //       if (this.transferFormGroup.value.to_shop) {
    //         this.transferFormGroup.value.to_shop = {
    //           projectId: this.transferFormGroup.value.to_shop.projectId,
    //           name: this.transferFormGroup.value.to_shop.name,
    //           applicationId: this.transferFormGroup.value.to_shop.applicationId
    //         };
    //       }
    //       this.transferState.save(this.transferFormGroup.value);
    //     }
    //   });
    // } else {
    //   this.message.showMobileInfoMessage(
    //     'Please fix all errors, and make sure you add at least one product then submit again',
    //     5000,
    //     'bottom');
    // }
  }

  addProductToTable($event: MouseEvent): void {
    $event.preventDefault();
    this.dialog.open(ProductSearchDialogComponent).afterClosed().subscribe(value => {
      if (value && value.product) {
        this.selectedProducts.unshift({
          quantity: 1,
          product: value
        });
        this.transfersDatasource = new MatTableDataSource<any>(this.selectedProducts);
        this.updateTotalCost();
      }
    });
  }

  removeItem($event: MouseEvent, element: { quantity: number, product: StockModel }): void {
    $event.preventDefault();
    this.selectedProducts = this.selectedProducts.filter(x => x.product.id !== element.product.id);
    this.transfersDatasource = new MatTableDataSource<any>(this.selectedProducts);
    this.updateTotalCost();
  }

  updateQuantity(element: { quantity: number, product: StockModel }, $event: Event): void {
    // @ts-ignore
    const newQuantity = Number($event.target.value);
    // if (newQuantity <= 0) {
    //   newQuantity = 1;
    // }
    this.selectedProducts.map(x => {
      if (x.product.id === element.product.id) {
        x.quantity = newQuantity;
      }
      return x;
    });
    this.transfersDatasource = new MatTableDataSource<{ quantity: number; product: StockModel }>(this.selectedProducts);
    this.updateTotalCost();
  }
}
