import { NgModule } from "@angular/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatListModule } from "@angular/material/list";
import { RouterModule, ROUTES, Routes } from "@angular/router";
import { ProductsPage } from "./pages/products.page";
import {
  DialogDeleteComponent,
  StockDetailsComponent
} from "./components/stock.component";
import { CreatePageComponent } from "./pages/product-create.page";
import { EditPageComponent } from "./pages/product-edit.page";
import { CategoriesComponent } from "./components/categories.component";
import {
  DialogUnitDeleteComponent,
  DialogUnitNewComponent,
  UnitsComponent
} from "./components/units.component";
import {
  DialogSupplierDeleteComponent,
  SuppliersComponent
} from "./components/suppliers.component";
import { ImportsDialogComponent } from "./components/imports.component";
import { CommonModule } from "@angular/common";
import { LibModule, PaymentGuard } from "smartstock-core";
import { CategoryFormFieldComponent } from "./components/category-form-field.component";
import { SuppliersFormFieldComponent } from "./components/suppliers-form-field.component";
import { UnitsFormFieldComponent } from "./components/units-form-field.component";
import { ProductShortDetailFormComponent } from "./components/product-short-detail-form.component";
import { IndexPage } from "./pages";
import { UnitsPage } from "./pages/units.page";
import { SuppliersPage } from "./pages/suppliers.page";
import { CategoriesPage } from "./pages/categories.page";
import { DialogCategoryDeleteComponent } from "./components/dialog-category-delete.component";
import { DialogCategoryCreateComponent } from "./components/dialog-category-create.component";
import { TotalProductsSummaryComponent } from "./components/total-products-summary.component";
import { ProductsValueSummaryComponent } from "./components/products-value-summary.component";
import { TransferPage } from "./pages/transfer.page";
import { MatSortModule } from "@angular/material/sort";
import { CdkTableModule } from "@angular/cdk/table";
import { ProductsTableComponent } from "./components/products-table.component";
import { ProductsTableSubActionsComponent } from "./components/products-table-sub-actions.component";
import { TransfersTableComponent } from "./components/transfers-table.component";
import { TransfersTableActionsComponent } from "./components/transfers-table-actions.component";
import { TransferCreatePage } from "./pages/transfer-create.page";
import { TransferCreateFormComponent } from "./components/transfer-create-form.component";
import { ManyShopsGuard } from "./guards/many-shops.guard";
import { ProductSearchDialogComponent } from "./components/product-search-dialog.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { InfoDialogComponent } from "./components/info-dialog.component";
import { TransfersItemsViewComponent } from "./components/transfers-items-view.component";
import { TransfersExportOptionsComponent } from "./components/transfers-export-options.component";
import { DownloadableComponent } from "./components/downloadable.component";
import { SuppliersCreatePage } from "./pages/suppliers-create.page";
import { SupplierCreateFormComponent } from "./components/supplier-create-form.component";
import { MetasFormFieldComponent } from "./components/metas-form-field.component";
import { GeneratedFormFieldComponent } from "./components/generated-form-field.component";
import { SuppliersEditPage } from "./pages/suppliers-edit.page";
import { SupplierCreateFormBottomSheetComponent } from "./components/supplier-create-form-bottom-sheet.component";
import { CategoryCreatePage } from "./pages/category-create.page";
import { CategoryCreateFormComponent } from "./components/category-create-form.component";
import { CategoriesEditPage } from "./pages/categories-edit.page";
import { CategoryCreateFormBottomSheetComponent } from "./components/category-create-form-bottom-sheet.component";
import { StockNavigationService } from "./services/stock-navigation.service";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { ProductsListComponent } from "./components/products-list.component";
import { ImageUploadComponent } from "./components/image-upload.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { StockQuantityComponent } from "./components/stock-quantity.component";
import { CategoriesDesktopContextMenuComponent } from "./components/categories-desktop-context-menu.component";
import { CategoriesTableComponent } from "./components/categories-table.component";
import { ProductQuantityTrackPage } from "./pages/product-quantity-track.page";
import { StockQuantityTrackingHeadComponent } from "./components/stock-quantity-tracking-head.component";
import { StockQuantityTrackingHistogramComponent } from "./components/stock-quantity-tracking-histogram.component";
import { StockQuantityTrackingComponent } from "./components/stock-quantity-tracking.component";
import { StockQuantityTrackingTableComponent } from "./components/stock-quantity-tracking-table.component";
import { TransferDesktopUx } from "./components/transfer-desktop-ux";
import { TransferHeaderForm } from "./components/transfer-header-form";
import { TransferHeaderDialog } from "./components/transfer-header-dialog";
import { TransferHeaderSheet } from "./components/transfer-header-sheet";
import { TransferCart } from "./components/transfer-cart";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatBadgeModule } from "@angular/material/badge";
import { TransferCreateDesktopUx } from "./components/transfer-create-desktop-ux";
import { ProductTile } from "./components/product-tile";
import { AddToCartFormComponent } from "./components/add-to-cart-form.component";
import { AddToCartDialogComponent } from "./components/add-to-cart-dialog.component";
import { AddToCartSheetComponent } from "./components/add-to-cart-sheet.component";
import { RetailValue } from "./components/reatail-value";
import { WholeValue } from "./components/whole-value";
import { IndexDesktopPage } from "./components/index_desktop";

const routes: Routes = [
  { path: "", component: IndexPage },
  { path: "products", component: ProductsPage },
  { path: "products/create", component: CreatePageComponent },
  { path: "products/:id/edit", component: EditPageComponent },
  { path: "products/:id/quantity", component: ProductQuantityTrackPage },
  { path: "categories", component: CategoriesPage },
  { path: "categories/create", component: CategoryCreatePage },
  { path: "categories/edit/:id", component: CategoriesEditPage },
  { path: "units", component: UnitsPage },
  { path: "suppliers", component: SuppliersPage },
  { path: "suppliers/create", component: SuppliersCreatePage },
  { path: "suppliers/edit/:id", component: SuppliersEditPage },
  {
    path: "transfers",
    canActivate: [PaymentGuard, ManyShopsGuard],
    component: TransferPage
  },
  {
    path: "transfers/create",
    canActivate: [PaymentGuard, ManyShopsGuard],
    component: TransferCreatePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    {
      ngModule: RouterModule,
      providers: [
        {
          provide: ROUTES,
          multi: true,
          useValue: routes
        }
      ]
    },
    LibModule,
    MatSidenavModule,
    MatCardModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTooltipModule,
    MatRippleModule,
    MatMenuModule,
    MatBottomSheetModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatDialogModule,
    MatListModule,
    MatSortModule,
    CdkTableModule,
    ScrollingModule,
    FormsModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatBadgeModule,
  ],
  declarations: [
    StockQuantityTrackingHeadComponent,
    StockQuantityTrackingComponent,
    StockQuantityTrackingTableComponent,
    StockQuantityTrackingHistogramComponent,
    CategoriesTableComponent,
    ProductQuantityTrackPage,
    CategoriesDesktopContextMenuComponent,
    StockQuantityComponent,
    SupplierCreateFormComponent,
    CategoriesEditPage,
    CategoryCreateFormBottomSheetComponent,
    CategoryCreatePage,
    SuppliersCreatePage,
    SuppliersEditPage,
    SupplierCreateFormBottomSheetComponent,
    MetasFormFieldComponent,
    GeneratedFormFieldComponent,
    SuppliersCreatePage,
    DownloadableComponent,
    TransfersItemsViewComponent,
    TransfersExportOptionsComponent,
    InfoDialogComponent,
    TransferCreateFormComponent,
    TransfersTableComponent,
    TransfersTableActionsComponent,
    ProductsTableComponent,
    DialogDeleteComponent,
    IndexPage,
    CreatePageComponent,
    EditPageComponent,
    CategoriesComponent,
    SuppliersComponent,
    UnitsComponent,
    StockDetailsComponent,
    DialogCategoryDeleteComponent,
    DialogCategoryCreateComponent,
    DialogUnitDeleteComponent,
    DialogUnitNewComponent,
    DialogSupplierDeleteComponent,
    ImportsDialogComponent,
    CategoryFormFieldComponent,
    SuppliersFormFieldComponent,
    UnitsFormFieldComponent,
    ProductShortDetailFormComponent,
    ProductShortDetailFormComponent,
    UnitsPage,
    SuppliersPage,
    CategoriesPage,
    ProductsPage,
    TotalProductsSummaryComponent,
    ProductsValueSummaryComponent,
    TransferPage,
    ProductsTableSubActionsComponent,
    TransferCreatePage,
    ProductSearchDialogComponent,
    CategoryCreateFormComponent,
    ProductsListComponent,
    ImageUploadComponent,
    TransferDesktopUx,
    TransferHeaderDialog,
    TransferHeaderForm,
    TransferHeaderSheet,
    TransferCart,
    TransferCreateDesktopUx,
    ProductTile,
    AddToCartFormComponent,
    AddToCartDialogComponent,
    AddToCartSheetComponent,
    RetailValue,
    WholeValue,
    IndexDesktopPage
  ]
})
export class StocksModule {
  constructor(private readonly stockNav: StockNavigationService) {
    this.stockNav.init();
    this.stockNav.selected();
  }
}
