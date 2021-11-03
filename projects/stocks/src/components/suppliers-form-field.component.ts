import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {SupplierService} from '../services/supplier.service';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {SupplierCreateFormBottomSheetComponent} from './supplier-create-form-bottom-sheet.component';
import {database} from 'bfast';
import {UserService} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-suppliers-form-field',
  template: `
    <div [formGroup]="formGroup">
      <mat-form-field *ngIf="purchasable === true" appearance="outline"
                      class="my-input">
        <mat-label>Supplier</mat-label>
        <mat-select [multiple]="false" formControlName="supplier">
          <mat-option *ngFor="let supplier of suppliers | async" [value]="supplier.name">
            {{supplier.name}}
          </mat-option>
        </mat-select>
        <mat-progress-spinner matTooltip="Fetching suppliers"
                              *ngIf="suppliersFetching" matSuffix color="accent"
                              mode="indeterminate"
                              [diameter]="20"></mat-progress-spinner>
        <mat-error>Supplier required</mat-error>
        <div matSuffix class="d-flex flex-row">
          <button (click)="refreshSuppliers($event)" mat-icon-button matTooltip="refresh suppliers"
                  *ngIf="!suppliersFetching">
            <mat-icon>refresh</mat-icon>
          </button>
          <button (click)="addNewSupplier($event)" mat-icon-button matTooltip="add new supplier"
                  *ngIf="!suppliersFetching">
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-form-field>
    </div>
  `
})

export class SuppliersFormFieldComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() purchasable = true;
  suppliers: Observable<any[]>;
  suppliersFetching = true;
  private sig = false;
  private obfn;

  constructor(private readonly supplierService: SupplierService,
              private readonly bottomSheet: MatBottomSheet,
              private readonly userService: UserService) {
  }

  observer(_): void {
    if (this?.sig === false) {
      this.getSuppliers();
      this.sig = true;
    } else {
      return;
    }
  }

  async ngOnInit(): Promise<void> {
    this.getSuppliers();
  }

  async ngOnDestroy(): Promise<void> {
    if (this.obfn){
      this?.obfn?.unobserve();
    }
  }

  getSuppliers(): void {
    this.suppliersFetching = true;
    this.supplierService.getAllSupplier().then(value => {
      this.suppliersFetching = false;
      this.suppliers = of(value);
    }).catch(_ => {
      this.suppliersFetching = false;
      this.suppliers = of([{name: 'Default'}]);
    });
  }

  reload(): void {
    this.suppliersFetching = true;
    this.supplierService.getAllSupplierRemotely().then(value => {
      this.suppliersFetching = false;
      this.suppliers = of(value);
    }).catch(_ => {
      this.suppliersFetching = false;
      this.suppliers = of([{name: 'Default'}]);
    });
  }

  addNewSupplier($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.bottomSheet.open(SupplierCreateFormBottomSheetComponent, {
      data: {
        supplier: null
      }
    }).afterDismissed().subscribe(value => {
      this.getSuppliers();
    });
  }

  refreshSuppliers($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.reload();
  }

}
