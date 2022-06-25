import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CategoryCreateFormBottomSheetComponent } from "./category-create-form-bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { CategoryState } from "../states/category.state";
import { database } from "bfast";
import { UserService } from "smartstock-core";

@Component({
  selector: "app-category-form-field",
  template: `
    <div [formGroup]="formGroup">
      <mat-form-field appearance="outline" class="my-input">
        <mat-label>Category</mat-label>
        <mat-select [multiple]="false" formControlName="category">
          <mat-option
            *ngFor="let category of categoryState.categories | async"
            [value]="category.name"
          >
            {{ category.name }}
          </mat-option>
        </mat-select>
        <mat-progress-spinner
          matTooltip="Fetching units"
          *ngIf="categoryState.isFetchCategories | async"
          matSuffix
          color="accent"
          mode="indeterminate"
          [diameter]="20"
        ></mat-progress-spinner>
        <mat-error
          *ngIf="
            formGroup.get('category').invalid &&
            formGroup.get('category').touched
          "
          class="error-text"
        >
          Category required
        </mat-error>
        <div matSuffix class="d-flex flex-row">
          <button
            (click)="refreshCategories($event)"
            mat-icon-button
            matTooltip="refresh categories"
            *ngIf="(categoryState.isFetchCategories | async) === false"
          >
            <mat-icon>refresh</mat-icon>
          </button>
          <button
            (click)="addNewCategory($event)"
            mat-icon-button
            matTooltip="add new category"
            *ngIf="(categoryState.isFetchCategories | async) === false"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-form-field>
    </div>
  `
})
export class CategoryFormFieldComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  private sig = false;
  private obfn;

  constructor(
    public readonly categoryState: CategoryState,
    private readonly userService: UserService,
    private readonly bottomSheet: MatBottomSheet
  ) {}

  observer(_): void {
    if (this?.sig === false) {
      this.getCategories();
      this.sig = true;
    } else {
      return;
    }
  }

  async ngOnInit(): Promise<void> {
    this.categoryState.startChanges();
    this.getCategories();
  }

  async ngOnDestroy(): Promise<void> {
    this.categoryState.stopChanges();
    if (this.obfn) {
      this?.obfn?.unobserve();
    }
  }

  getCategories(): void {
    this.categoryState.getCategories();
  }

  addNewCategory($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.bottomSheet
      .open(CategoryCreateFormBottomSheetComponent, {
        data: {
          category: null
        }
      })
      .afterDismissed()
      .subscribe((_) => {
        this.getCategories();
      });
  }

  refreshCategories($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.categoryState.getCategoriesRemote();
  }
}
