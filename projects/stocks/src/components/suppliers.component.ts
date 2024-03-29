import { Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { UntypedFormBuilder } from "@angular/forms";
import { SupplierModel } from "../models/supplier.model";
import { MatPaginator } from "@angular/material/paginator";
import { SupplierService } from "../services/supplier.service";
import { SupplierState } from "../states/supplier.state";
import { Router } from "@angular/router";
import { DeviceState, UserService } from "smartstock-core";

@Component({
  selector: "app-suppliers",
  template: `
    <div class="table-options">
      <button
        routerLink="/stock/suppliers/create"
        color="primary"
        class="menu-button"
        mat-button
      >
        Add Supplier
      </button>
      <button (click)="reload()" mat-button class="menu-button">
        Reload Suppliers
      </button>
    </div>
    <div class="smartstock-table">
      <table
        style="margin-top: 16px"
        class="my-input"
        *ngIf="
          !fetchSuppliersFlag && suppliersArray && suppliersArray.length > 0
        "
        mat-table
        [dataSource]="suppliersDatasource"
      >
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">
            {{ element.name }}
          </td>
        </ng-container>

        <ng-container matColumnDef="mobile">
          <th mat-header-cell *matHeaderCellDef>Mobile</th>
          <td mat-cell *matCellDef="let element">
            {{ element.number }}
          </td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let element">
            {{ element.email }}
          </td>
        </ng-container>

        <ng-container matColumnDef="address">
          <th mat-header-cell *matHeaderCellDef>Address</th>
          <td mat-cell *matCellDef="let element">
            {{ element.address }}
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>
            <!--          <div class="d-flex justify-content-end align-items-end">-->
            <!--            Actions-->
            <!--          </div>-->
          </th>
          <td mat-cell *matCellDef="let element">
            <div class="d-flex justify-content-end align-items-end">
              <button color="primary" mat-icon-button>
                <mat-icon>more_vert</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr
          mat-header-row
          *matHeaderRowDef="
            (deviceState.isSmallScreen | async) === true
              ? suppliersTableColumsMobile
              : suppliersTableColums
          "
        ></tr>
        <tr
          mat-row
          [matMenuTriggerFor]="opts"
          class="table-data-row"
          *matRowDef="
            let element;
            columns: (deviceState.isSmallScreen | async) === true
              ? suppliersTableColumsMobile
              : suppliersTableColums
          "
        >
          <div style="display: flex;">
            <div style="flex-grow: 1"></div>
            <mat-menu #opts [xPosition]="'after'">
              <!--                  <button (click)="viewSupplier(element)" mat-menu-item>-->
              <!--                    View-->
              <!--                  </button>-->
              <button (click)="editSupplier(element)" mat-menu-item>
                Edit
              </button>
              <button (click)="deleteSupplier(element)" mat-menu-item>
                Delete
              </button>
            </mat-menu>
          </div>
        </tr>
      </table>
      <div *ngIf="fetchSuppliersFlag">
        <mat-progress-spinner
          matTooltip="fetch suppliers"
          [diameter]="30"
          mode="indeterminate"
          color="primary"
        >
        </mat-progress-spinner>
      </div>
      <mat-paginator
        #matPaginator
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 50]"
        showFirstLastButtons
      ></mat-paginator>
    </div>
  `,
  styleUrls: ["../styles/suppliers.style.scss", "../styles/index.style.scss"]
})
export class SuppliersComponent implements OnInit, OnDestroy {
  @ViewChild("matPaginator") matPaginator: MatPaginator;
  suppliersDatasource: MatTableDataSource<
    SupplierModel
  > = new MatTableDataSource<SupplierModel>([]);
  suppliersTableColums = ["name", "email", "mobile", "address", "actions"];
  suppliersTableColumsMobile = ["name", "mobile", "actions"];
  suppliersArray: SupplierModel[] = [];
  fetchSuppliersFlag = false;
  private sig = false;

  constructor(
    private readonly supplierService: SupplierService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    public readonly deviceState: DeviceState,
    private readonly supplierState: SupplierState,
    private readonly userService: UserService,
    private readonly snack: MatSnackBar
  ) {}

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

  async ngOnDestroy(): Promise<void> {}

  searchSupplier(query: string): void {
    // if ($event && $event.query) {
    //   this.fetchSuppliersFlag = true;
    //   this.stockDatabase.searchSupplier($event.query, {size: 20}).then(data => {
    //     this.suppliersArray = JSON.parse(JSON.stringify(data));
    //     // this.skip +=this.productsArray.length;
    //     this.suppliersDatasource = new MatTableDataSource(this.suppliersArray);
    //     this.fetchSuppliersFlag = false;
    //     // this.size = 0;
    //   }).catch(reason => {
    //     this.snack.open(reason, 'Ok', {
    //       duration: 3000
    //     });
    //     this.fetchSuppliersFlag = false;
    //   });
    // } else {
    //   this.getSuppliers();
    // }
  }

  getSuppliers(): void {
    this.fetchSuppliersFlag = true;
    this.supplierService
      .getAllSupplier()
      .then((data) => {
        this.suppliersArray = data;
        this.suppliersDatasource = new MatTableDataSource<SupplierModel>(
          this.suppliersArray
        );
        this.suppliersDatasource.paginator = this.matPaginator;
        this.fetchSuppliersFlag = false;
      })
      .catch((_) => {
        this.fetchSuppliersFlag = false;
      });
  }

  reload(): void {
    this.fetchSuppliersFlag = true;
    this.supplierService
      .getAllSupplierRemotely()
      .then((value) => {
        this.fetchSuppliersFlag = false;
        this.suppliersArray = value;
        this.suppliersDatasource = new MatTableDataSource<SupplierModel>(
          this.suppliersArray
        );
      })
      .catch((_) => {
        this.fetchSuppliersFlag = false;
        if (
          Array.isArray(this.suppliersArray) &&
          this.suppliersArray.length > 0
        ) {
          return;
        }
        this.suppliersArray = [{ name: "Default", id: "default" }];
        this.suppliersDatasource = new MatTableDataSource<SupplierModel>(
          this.suppliersArray
        );
      });
  }

  deleteSupplier(element: any): void {
    this.dialog
      .open(DialogSupplierDeleteComponent, {
        data: element,
        disableClose: true
      })
      .afterClosed()
      .subscribe((_) => {
        if (_) {
          this.suppliersArray = this.suppliersArray.filter(
            (value) => value.id !== element.id
          );
          this.suppliersDatasource = new MatTableDataSource<SupplierModel>(
            this.suppliersArray
          );
          this.snack.open("Supplier deleted", "Ok", {
            duration: 2000
          });
        } else {
          this.snack.open("Supplier not deleted", "Ok", {
            duration: 2000
          });
        }
      });
  }

  editSupplier(element: SupplierModel): void {
    this.supplierState.selectedForEdit.next(element);
    this.router
      .navigateByUrl("/stock/suppliers/edit/" + element.id)
      .catch((_) => {});
  }
}

@Component({
  selector: "app-dialog-delete",
  template: `
    <div class="container">
      <div class="row">
        <div class="col-12">
          <mat-panel-title class="text-center">
            Your about to delete : <b>{{ " " + data.name }}</b>
          </mat-panel-title>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <div class="align-self-center" style="margin: 8px">
          <button
            [disabled]="deleteProgress"
            color="primary"
            mat-button
            (click)="deleteSupplier(data)"
          >
            Delete
            <mat-progress-spinner
              *ngIf="deleteProgress"
              matTooltip="Delete in progress..."
              style="display: inline-block"
              mode="indeterminate"
              diameter="15"
              color="accent"
            ></mat-progress-spinner>
          </button>
        </div>
        <div class="alert-secondary" style="margin: 8px">
          <button
            mat-dialog-close
            [disabled]="deleteProgress"
            color="primary"
            mat-button
            (click)="cancel()"
          >
            Cancel
          </button>
        </div>
      </div>
      <p class="bg-danger" *ngIf="errorSupplierMessage">
        {{ errorSupplierMessage }}
      </p>
    </div>
  `
})
export class DialogSupplierDeleteComponent {
  deleteProgress = false;
  errorSupplierMessage: string;

  constructor(
    public dialogRef: MatDialogRef<DialogSupplierDeleteComponent>,
    private readonly supplierService: SupplierService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  deleteSupplier(supplier: SupplierModel): void {
    this.errorSupplierMessage = undefined;
    this.deleteProgress = true;
    this.supplierService
      .deleteSupplier(supplier.id)
      .then((value) => {
        this.dialogRef.close(supplier);
        this.deleteProgress = false;
      })
      .catch((_) => {
        this.errorSupplierMessage = "Fails to delete supplier, try again";
        this.deleteProgress = false;
      });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
