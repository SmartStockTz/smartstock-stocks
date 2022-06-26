import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { Observable, of } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { DialogUnitNewComponent } from "./units.component";
import { UnitsService } from "../services/units.service";
import { UserService } from "smartstock-core";

@Component({
  selector: "app-units-form-field",
  template: `
    <div [formGroup]="formGroup" *ngIf="stockable">
      <mat-form-field appearance="outline" class="my-input">
        <mat-label>Unit</mat-label>
        <mat-select formControlName="unit">
          <mat-option *ngFor="let unit of units | async" [value]="unit.name">
            {{ unit.name }}
          </mat-option>
        </mat-select>
        <mat-progress-spinner
          matTooltip="Fetching units"
          *ngIf="unitsFetching"
          matSuffix
          color="accent"
          mode="indeterminate"
          [diameter]="20"
        ></mat-progress-spinner>
        <mat-error>Unit required</mat-error>
        <div matSuffix class="d-flex flex-row">
          <button
            (click)="refreshUnits($event)"
            mat-icon-button
            matTooltip="refresh units"
            *ngIf="!unitsFetching"
          >
            <mat-icon>refresh</mat-icon>
          </button>
          <button
            (click)="addNewUnit($event)"
            mat-icon-button
            matTooltip="add new unit"
            *ngIf="!unitsFetching"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-form-field>
    </div>
  `
})
export class UnitsFormFieldComponent implements OnInit, OnDestroy {
  @Input() formGroup: UntypedFormGroup;
  units: Observable<[any]>;
  unitsFetching = true;
  @Input() stockable = false;

  constructor(
    private readonly unitsService: UnitsService,
    private readonly userService: UserService,
    private readonly dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    this.getUnits();
  }

  async ngOnDestroy(): Promise<void> {}

  getUnits(): void {
    this.unitsFetching = true;
    this.unitsService
      .getAllUnit()
      .then((unitsObjects) => {
        this.units = of(JSON.parse(JSON.stringify(unitsObjects)));
        this.unitsFetching = false;
      })
      .catch((reason) => {
        this.units = of([{ name: "No unit" }]);
        console.warn(reason);
        this.unitsFetching = false;
      });
  }

  reload(): void {
    this.unitsFetching = true;
    this.unitsService
      .getAllUnitRemotely()
      .then((unitsObjects) => {
        this.units = of(JSON.parse(JSON.stringify(unitsObjects)));
        this.unitsFetching = false;
      })
      .catch((reason) => {
        this.units = of([{ name: "No unit" }]);
        console.warn(reason);
        this.unitsFetching = false;
      });
  }

  addNewUnit($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.dialog
      .open(DialogUnitNewComponent, {
        closeOnNavigation: true
      })
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.getUnits();
        }
      });
  }

  refreshUnits($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.reload();
  }
}
