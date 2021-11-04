import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CategoryState} from '../states/category.state';
import {DeviceState} from '@smartstocktz/core-libs';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-categories',
  template: `
    <app-categories-desktop-context-menu></app-categories-desktop-context-menu>
    <mat-progress-bar *ngIf="show" mode="indeterminate" color="primary">
    </mat-progress-bar>
    <app-categories-table></app-categories-table>
  `,
  styleUrls: ['../styles/categories.style.scss']
})
export class CategoriesComponent implements AfterViewInit, OnInit {
  show = false;
  destroyer: Subject<any> = new Subject<any>();

  constructor(public readonly deviceState: DeviceState,
              public readonly categoryState: CategoryState) {
  }

  ngAfterViewInit(): void {
    this.categoryState.isFetchCategories.pipe(takeUntil(this.destroyer)).subscribe(value => {
      setTimeout(() => {
        this.show = value;
      }, 0);
    });
  }

  ngOnInit(): void {
    this.destroyer.next('done');
  }
}

