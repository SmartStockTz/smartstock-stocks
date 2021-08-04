import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableDataSource} from '@angular/material/table';
import {FormBuilder} from '@angular/forms';
import {CategoryModel} from '../models/category.model';
import {MatPaginator} from '@angular/material/paginator';
import {DialogCategoryDeleteComponent} from './dialog-category-delete.component';
import {CategoryService} from '../services/category.service';
import {Router} from '@angular/router';
import {CategoryState} from '../states/category.state';
import {DeviceState} from '@smartstocktz/core-libs';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-categories',
  template: `
    <div class="d-flex flex-row flex-wrap">
      <button routerLink="/stock/categories/create" color="primary" mat-button>
        <mat-icon>add</mat-icon>
        Create
      </button>
      <button [disabled]="categoryState.isFetchCategories | async" (click)="reload()" color="primary" mat-button>
        <mat-icon>refresh</mat-icon>
        Reload
      </button>
      <span style="flex: 1 1 auto"></span>
      <mat-paginator #matPaginator [pageSize]="50" showFirstLastButtons></mat-paginator>
    </div>

    <div>
      <div *ngIf="categoryState.isFetchCategories | async">
        <mat-progress-bar matTooltip="fetch categories" mode="indeterminate" color="primary"></mat-progress-bar>
      </div>
      <table class="my-input" mat-table [dataSource]="categoriesDatasource.connect() | async">
        <ng-container matColumnDef="check">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox></mat-checkbox>
          </th>
          <td class="editable" matRipple mat-cell
              *matCellDef="let element">
            <mat-checkbox></mat-checkbox>
          </td>
        </ng-container>

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

        <tr mat-header-row *matHeaderRowDef="categoriesTableColums"></tr>
        <tr mat-row class="table-data-row" *matRowDef="let row; columns: categoriesTableColums;"></tr>
      </table>
    </div>
  `,
  styleUrls: ['../styles/categories.style.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('matPaginator') matPaginator: MatPaginator;
  categoriesDatasource = new MatTableDataSource<CategoryModel>([]);
  categoriesTableColums = ['check', 'name', 'description', 'actions'];
  destroyer = new Subject<any>();

  constructor(private readonly stockDatabase: CategoryService,
              private readonly formBuilder: FormBuilder,
              private readonly dialog: MatDialog,
              public readonly deviceState: DeviceState,
              public readonly categoryState: CategoryState,
              private readonly router: Router,
              private readonly snack: MatSnackBar) {
  }

  ngOnInit(): void {
    this.categoryState.startChanges();
    this.categoryState.categories.pipe(
      takeUntil(this.destroyer)
    ).subscribe(value => {
      if (Array.isArray(value)) {
        this.categoriesDatasource.data = value;
      }
    });
    this.getCategories();
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
    }).afterClosed().subscribe(_ => {
      if (_) {
        this.categoryState.getCategories();
      } else {
        this.snack.open('Category not deleted', 'Ok', {
          duration: 2000
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.categoriesDatasource.paginator = this.matPaginator;
  }

  ngOnDestroy(): void {
    this.categoryState.stopChanges();
    this.destroyer.next('done');
  }

  getCategories(): void {
    this.categoryState.getCategories();
  }

  reload(): void {
    this.categoryState.getCategoriesRemote();
  }
}

