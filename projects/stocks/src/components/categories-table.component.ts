import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {DialogCategoryDeleteComponent} from './dialog-category-delete.component';
import {MatTableDataSource} from '@angular/material/table';
import {CategoryModel} from '../models/category.model';
import {MatDialog} from '@angular/material/dialog';
import {CategoryState} from '../states/category.state';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-categories-table',
  template: `
    <table class="my-input" mat-table [dataSource]="categoriesDatasource.connect() | async">
      <!--      <ng-container matColumnDef="check">-->
      <!--        <th mat-header-cell *matHeaderCellDef>-->
      <!--          <mat-checkbox></mat-checkbox>-->
      <!--        </th>-->
      <!--        <td class="editable" matRipple mat-cell-->
      <!--            *matCellDef="let element">-->
      <!--          <mat-checkbox></mat-checkbox>-->
      <!--        </td>-->
      <!--      </ng-container>-->

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td class="editable" matRipple mat-cell
            *matCellDef="let element">{{element.name}}
        </td>
      </ng-container>

      <ng-container matColumnDef="description">
        <th mat-header-cell *matHeaderCellDef>Description</th>
        <td class="editable" matRipple mat-cell
            *matCellDef="let element">{{element.description}}
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>
          <div class="d-flex justify-content-end align-items-end">
            Actions
          </div>
        </th>
        <td mat-cell *matCellDef="let element">
          <div class="d-flex justify-content-end align-items-end">
            <button [matMenuTriggerFor]="opts" color="primary" mat-icon-button>
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #opts>
              <button (click)="editCategory(element)" mat-menu-item>
                Edit
              </button>
              <button (click)="deleteCategory(element)" mat-menu-item>
                Delete
              </button>
            </mat-menu>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="categoriesTableColumns"></tr>
      <tr mat-row class="table-data-row" *matRowDef="let row; columns: categoriesTableColumns;"></tr>
    </table>
  `,
  styleUrls: ['../styles/categories.style.scss']
})

export class CategoriesTableComponent implements OnInit, OnDestroy, AfterViewInit {
  categoriesDatasource = new MatTableDataSource<CategoryModel>([]);
  categoriesTableColumns = ['name', 'description', 'actions'];
  destroyer = new Subject<any>();

  constructor(private readonly dialog: MatDialog,
              public readonly categoryState: CategoryState,
              private readonly snack: MatSnackBar,
              private readonly router: Router) {
  }

  editCategory(element: CategoryModel): void {
    this.categoryState.selectedForEdit.next(element);
    this.router.navigateByUrl('/stock/categories/edit/' + element.id).catch(_ => {
    });
  }

  deleteCategory(element: any): void {
    this.dialog.open(DialogCategoryDeleteComponent, {
      data: element,
      disableClose: true
    }).afterClosed().pipe(takeUntil(this.destroyer)).subscribe(_ => {
      if (_) {
        this.categoryState.getCategories();
      } else {
        this.snack.open('Category not deleted', 'Ok', {
          duration: 2000
        });
      }
    });
  }

  ngOnInit(): void {
    this.categoryState.categories.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      if (Array.isArray(value)) {
        this.categoriesDatasource.data = value;
      }
    });
    this.categoryState.getCategories();
  }

  ngOnDestroy(): void {
    this.categoryState.stopChanges();
    this.destroyer.next('done');
  }

  ngAfterViewInit(): void {
    // this.categoriesDatasource.paginator = this.paginator;
  }
}
