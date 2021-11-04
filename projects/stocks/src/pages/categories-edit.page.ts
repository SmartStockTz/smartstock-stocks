import {Component, OnDestroy, OnInit} from '@angular/core';
import {DeviceState} from '@smartstocktz/core-libs';
import {CategoryState} from '../states/category.state';
import {ActivatedRoute, Router} from '@angular/router';
import {CategoryModel} from '../models/category.model';

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
          <div class="container col-lg-9 col-xl-9 col-sm-11 col-md-10 col-11" style="min-height: 100vh">
            <app-stock-category-create-form
              *ngIf="category"
              [category]="category"></app-stock-category-create-form>
          </div>
        </div>
      </ng-template>
    </app-layout-sidenav>
  `
})
export class CategoriesEditPage implements OnDestroy, OnInit {
  category: CategoryModel;

  constructor(public readonly categoryState: CategoryState,
              public readonly deviceState: DeviceState,
              private readonly activatedRoute: ActivatedRoute,
              private readonly router: Router) {
    document.title = 'SmartStock - Category Edit';
  }

  ngOnDestroy(): void {
    this.categoryState.selectedForEdit.next(null);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(value => {
      // console.log(value);
      if (value && value.id) {
        this.categoryState.getCategory(value.id).then(value1 => {
          if (!value1) {
            throw new Error('no category');
          }
          this.category = value1;
        }).catch(_87 => {
          this.router.navigateByUrl('/stock/categories').catch(console.log);
        });
      } else {
        this.router.navigateByUrl('/stock/categories').catch(console.log);
      }
    }, _23 => {
      this.router.navigateByUrl('/stock/categories').catch(console.log);
    });
  }
}
