import {Injectable} from '@angular/core';
import {ConfigsService} from '@smartstocktz/core-libs';

@Injectable({
  providedIn: 'root'
})
export class StockNavigationService {
  constructor(private readonly configs: ConfigsService) {
  }

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
          roles: ['admin', 'manager']
        },
        {
          name: 'categories',
          link: '/stock/categories',
          roles: ['admin', 'manager']
        },
        // {
        //   name: 'catalogs',
        //   link: '/stock/catalogs',
        //   roles: ['admin', 'manager']
        // },
        {
          name: 'units',
          link: '/stock/units',
          roles: ['admin', 'manager']
        },
        {
          name: 'suppliers',
          link: '/stock/suppliers',
          roles: ['admin', 'manager']
        },
        {
          name: 'transfers',
          link: '/stock/transfers',
          roles: ['admin', 'manager']
        }
      ]
    });
  }

  selected(): void {
    this.configs.selectedModuleName = 'Stock';
  }
}
