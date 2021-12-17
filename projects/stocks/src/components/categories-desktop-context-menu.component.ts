import {Component} from '@angular/core';
import {CategoryState} from '../states/category.state';

@Component({
  selector: 'app-categories-desktop-context-menu',
  template: `
<!--    <div class="table-options-container">-->
      <div class="table-options">
        <button class="menu-button" routerLink="/stock/categories/create" mat-button>
          <!--        <mat-icon>add</mat-icon>-->
          Create
        </button>
        <button mat-button class="menu-button" [disabled]="categoryState.isFetchCategories | async" (click)="reload()">
          <!--        <mat-icon>refresh</mat-icon>-->
          Reload
        </button>
        <!--      <span style="flex: 1 1 auto"></span>-->
        <!--      <mat-paginator #matPaginator [pageSize]="50" showFirstLastButtons></mat-paginator>-->
      </div>
<!--    </div>-->
  `,
  styleUrls: ['../styles/categories-desktop-context-menu.style.scss',
    '../styles/stock-desktop.style.scss', '../styles/index.style.scss']
})

export class CategoriesDesktopContextMenuComponent {
  constructor(public readonly categoryState: CategoryState) {
  }

  reload(): void {
    this.categoryState.getCategoriesRemote();
  }
}
