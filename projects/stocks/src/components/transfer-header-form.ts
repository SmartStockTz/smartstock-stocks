import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserService} from '@smartstocktz/core-libs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-transfer-header-form',
  template: `
    <form [formGroup]="headerForm" (ngSubmit)="continue()">
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Date</mat-label>
        <input (click)="picker.open()"
               [readonly]="true" matInput formControlName="date" [matDatepicker]="picker">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker [touchUi]="true"></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Transfer to</mat-label>
        <mat-select [multiple]="false" formControlName="to_shop">
          <mat-option [value]="shop"
                      *ngFor="let shop of shops">{{shop.businessName}}</mat-option>
        </mat-select>
        <mat-error>Shop required</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Notes</mat-label>
        <textarea matInput formControlName="note" rows="3"></textarea>
        <mat-error>Write a transfer node</mat-error>
      </mat-form-field>
      <button style="width: 100%" color="primary" mat-flat-button>
        Continue
      </button>
    </form>
  `,
  styleUrls: []
})
export class TransferHeaderForm implements OnInit {
  headerForm: FormGroup;
  shops = [];
  @Output() done = new EventEmitter();

  constructor(private readonly userService: UserService,
              private readonly snack: MatSnackBar,
              private readonly formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.getOtherShops().catch(console.log);
    this.headerForm = this.formBuilder.group({
      date: [new Date(), [Validators.required, Validators.nullValidator]],
      to_shop: [null, [Validators.nullValidator, Validators.required]],
      note: ['stock transfer', [Validators.nullValidator, Validators.required]]
    });
  }

  private async getOtherShops(): Promise<void> {
    try {
      const cShop = await this.userService.getCurrentShop();
      const user = await this.userService.currentUser();
      const allShops = await this.userService.getShops(user);
      // @ts-ignore
      this.shops = allShops.filter(x => x.projectId !== cShop.projectId);
    } catch (e) {
      this.shops = [];
    }
  }

  continue(): void {
    if (this.headerForm.valid) {
      this.done.emit({
        date: this.headerForm.value.date,
        to_shop: {
          applicationId: this.headerForm.value.to_shop.applicationId,
          projectId: this.headerForm.value.to_shop.projectId,
          name: this.headerForm.value.to_shop.businessName
        },
        note: this.headerForm.value.note
      });
    } else {
      this.snack.open('Please fill all required field', 'Ok', {
        duration: 2000
      });
    }
  }
}
