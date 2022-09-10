import { Injectable } from '@angular/core';
import { NavigationService } from 'smartstock-core';

@Injectable({
  providedIn: 'root'
})
export class StockNavigationService {
  constructor(private readonly configs: NavigationService) {}

  init(): void {
    this.configs.addMenu({
      name: 'Stock',
      link: '/stock',
      icon: 'store',
      roles: ['admin', 'manager'],
      pages: [
        {
          name: 'products',
          link: '/stock/products',
          roles: ['admin', 'manager'],
          click: null
        },
        {
          name: 'categories',
          link: '/stock/categories',
          roles: ['admin', 'manager'],
          click: null
        },
        {
          name: 'units',
          link: '/stock/units',
          roles: ['admin', 'manager'],
          click: null
        },
        {
          name: 'suppliers',
          link: '/stock/suppliers',
          roles: ['admin', 'manager'],
          click: null
        },
        {
          name: 'transfers',
          link: '/stock/transfers',
          roles: ['admin', 'manager'],
          click: null
        }
      ]
    });
  }

  selected(): void {
    this.configs.selectedModuleName = 'Stock';
  }
}
