import { Component } from "@angular/core";

@Component({
    selector: 'index-desktop',
    templateUrl: './index_desktop.html',
    styleUrls: ['./index_desktop.scss']
})
export class IndexDesktopPage{
    pages = [
        {
          name: "Products",
          path: "/stock/products",
          detail: "Manage products",
          icon: "redeem"
        },
        {
          name: "Categories",
          path: "/stock/categories",
          detail: "Group your products",
          icon: "list"
        },
        {
          name: "Units",
          path: "/stock/units",
          detail: "Manage unit measures",
          icon: "straighten"
        },
        {
          name: "Suppliers",
          path: "/stock/suppliers",
          detail: "Manage product suppliers",
          icon: "airport_shuttle"
        },
        {
          name: "Transfers",
          path: "/stock/transfers",
          detail: "Move products to other shops",
          icon: "sync_alt"
        }
      ];
    
    constructor(){}
}