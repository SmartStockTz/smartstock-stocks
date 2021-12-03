import {Component} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {CategoryState} from '../states/category.state';


@Component({
  selector: 'app-stock-categories',
  template: `
    <app-layout-sidenav
      [heading]="'Categories'"
      [showSearch]="true"
      [searchPlaceholder]="'Type to search'"
      [leftDrawer]="side"
      [body]="body"
      [hasBackRoute]="true"
      backLink="/stock"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true"
      (searchCallback)="search($event)"
      [searchProgressFlag]="categoryState.isSearchCategories | async"
      [showProgress]="categoryState.isSearchCategories | async">
      <ng-template #side>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div>
          <div class="container-fluid categories-container">
            <app-categories></app-categories>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `,
  styleUrls: ['../styles/categories.style.scss']
})
export class CategoriesPage {

  constructor(public readonly deviceState: DeviceState,
              public readonly categoryState: CategoryState) {
    document.title = 'SmartStock - Categories';
  }

  search(q: string): void {
    this.categoryState.search(q);
  }
}




