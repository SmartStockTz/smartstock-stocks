import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-transfer-header-dialog',
  template: `
<!--    <div mat-dialog-title>-->

<!--    </div>-->
    <div mat-dialog-content>
      <app-transfer-header-form (done)="dialogRef.close($event)"></app-transfer-header-form>
    </div>
  `,
  styleUrls: []
})
export class TransferHeaderDialog{
  constructor(public readonly dialogRef: MatDialogRef<TransferHeaderDialog>) {
  }
}
