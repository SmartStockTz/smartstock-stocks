import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {CategoryState} from '../states/category.state';
import {Router} from '@angular/router';

@Component({
  selector: 'app-stock-category-edit',
  template: `
    <app-layout-sidenav
      [leftDrawer]="drawer"
      [body]="body"
      backLink="/stock/categories"
      [hasBackRoute]="true"
      [leftDrawerMode]="(deviceState.enoughWidth | async)===true?'side':'over'"
      heading="Edit Category"
      [leftDrawerOpened]="(deviceState.enoughWidth | async)===true">
      <ng-template #drawer>
        <app-drawer></app-drawer>
      </ng-template>
      <ng-template #body>
        <div class="container">
          <div class="container col-lg-9 col-xl-9 col-sm-12 col-md-10 col-112" style="min-height: 100vh">
            <app-stock-category-create-form
              [category]="categoryState.selectedForEdit | async"></app-stock-category-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class CategoriesEditPage implements OnDestroy, OnInit {
  constructor(public readonly categoryState: CategoryState,
              public readonly deviceState: DeviceState,
              private readonly router: Router) {
    document.title = 'SmartStock - Category Edit';
  }

  ngOnDestroy(): void {
    this.categoryState.selectedForEdit.next(null);
  }

  ngOnInit(): void {
    if (this.categoryState.selectedForEdit.value === null) {
      this.router.navigateByUrl('/stock/categories').catch(_ => {
      });
    }
  }
}
