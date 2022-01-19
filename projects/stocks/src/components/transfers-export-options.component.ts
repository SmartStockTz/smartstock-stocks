import {ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MessageService, PrintService} from '@smartstocktz/core-libs';
import {TransferModel} from '../models/transfer.model';
import {getProductFromTransferProduct} from '../utils/util';

// @dynamic
@Component({
  selector: 'app-stock-transfers-export-options',
  template: `
    <div style="display: flex; flex-direction: row">
      <div style="flex-grow: 1"></div>
      <button (click)="bottomSheetRef.dismiss()" mat-button color="warn">Close</button>
    </div>
    <div style="margin-bottom: 50px">
      <mat-nav-list>
        <mat-list-item (click)="printTransfer()" [disabled]="isPrinting">
          <h1 matLine>
            Thermal Printer
          </h1>
          <p matLine>Print as a receipt</p>
          <div matListIcon>
            <mat-icon *ngIf="!isPrinting">
              receipt
            </mat-icon>
            <mat-progress-spinner *ngIf="isPrinting" mode="indeterminate" color="primary" diameter="20"
                                  style="display: inline-block"></mat-progress-spinner>
          </div>
        </mat-list-item>
        <mat-divider></mat-divider>
      </mat-nav-list>
    </div>
  `
})
export class TransfersExportOptionsComponent {
  isPrinting = false;

  constructor(public readonly bottomSheetRef: MatBottomSheetRef<TransfersExportOptionsComponent>,
              private readonly printService: PrintService,
              private readonly message: MessageService,
              private readonly changeDet: ChangeDetectorRef,
              @Inject(MAT_BOTTOM_SHEET_DATA) private readonly data: { transfer: TransferModel }) {
  }

  private static getProduct(product: any): string {
    return getProductFromTransferProduct(product);
  }

  private static getPurchase(value): number {
    if (typeof value.product === 'object') {
      return value.product.purchase;
    }
    return value.to_purchase;
  }

  async printTransfer(): Promise<void> {
    let items = '';
    for (let i = 0; i < this.data.transfer.items.length; i++) {
      items += `
------------------------------------
ITEM ${i + 1} : ${TransfersExportOptionsComponent.getProduct(this.data.transfer.items[i].product)}
QUANTITY : ${Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(this.data.transfer.items[i].quantity)}, PURCHASE PRICE : ${Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(TransfersExportOptionsComponent.getPurchase(this.data.transfer.items[i]))}
`;
    }
    this.isPrinting = true;
    const data = [
      'DATE : ' + this.data.transfer.date + '\n',
      'FROM : ' + this.data.transfer.from_shop.name + '\n',
      'TO : ' + this.data.transfer.to_shop.name + '\n',
      'AMOUNT : ' + Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(this.data.transfer.amount) + '\n',
      'NOTE : ' + this.data.transfer.note + '\n',
      '\n',
      items
    ].join('');
    console.log(data);
    this.printService.print({
      printer: 'tm20',
      data,
      id: '',
      qr: ''
    }).then(value => {
      this.message.showMobileInfoMessage('Printed', 1000, 'bottom');
      this.bottomSheetRef.dismiss();
    }).catch(reason => {
      this.isPrinting = false;
      this.message.showMobileInfoMessage(reason && reason.message ? reason.message : reason.toString(),
        1000, 'bottom');
    }).finally(() => {
      this.isPrinting = false;
      this.changeDet.detectChanges();
    });
  }
}
