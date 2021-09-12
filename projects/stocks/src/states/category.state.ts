import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {CategoryModel} from '../models/category.model';
import {CategoryService} from '../services/category.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CategoryState {
  selectedForEdit = new BehaviorSubject<CategoryModel>(null);
  categories = new BehaviorSubject([]);
  isFetchCategories = new BehaviorSubject(false);
  isSaveCategory = new BehaviorSubject(false);
  isSearchCategories = new BehaviorSubject(false);

  constructor(private readonly categoryService: CategoryService,
              private readonly snack: MatSnackBar) {
  }

  startChanges(): void {
    this.categoryService.startChanges().catch(console.log);
  }

  stopChanges(): void {
    this.categoryService.stopChanges();
  }

  search(q: string): void {
    this.isSearchCategories.next(true);
    this.categoryService.search(q).then(value => {
      if (Array.isArray(value)) {
        this.categories.next(value);
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.isSearchCategories.next(false);
    });
  }

  private message(reason: any): void {
    this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
      duration: 2000
    });
  }

  getCategories(): void {
    this.isFetchCategories.next(true);
    this.categoryService.getAllCategory().then(value => {
      if (Array.isArray(value)) {
        this.categories.next(value);
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.isFetchCategories.next(false);
    });
  }

  getCategoriesRemote(): void {
    this.isFetchCategories.next(true);
    this.categoryService.getAllCategoryRemote().then(value => {
      if (Array.isArray(value)) {
        this.categories.next(value);
      }
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.isFetchCategories.next(false);
    });
  }

  save(category: CategoryModel): void {
    this.isSaveCategory.next(true);
    this.categoryService.save(category).then(_ => {
      this.getCategories();
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.isSaveCategory.next(false);
    });
  }

  async getCategory(id: string): Promise<CategoryModel> {
    return this.categoryService.getCategory(id);
  }
}
