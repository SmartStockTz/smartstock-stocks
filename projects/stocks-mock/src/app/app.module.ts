import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { init } from "bfast";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule, Routes } from "@angular/router";
import { MatNativeDateModule } from "@angular/material/core";
import { WelcomePage } from "./pages/welcome.page";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatMenuModule } from "@angular/material/menu";
import {
  ActiveShopGuard,
  AuthenticationGuard,
  LibModule,
  SyncsService
} from "smartstock-core";
import { StockService } from "../../../stocks/src/public-api";

const routes: Routes = [
  { path: "", component: WelcomePage },
  {
    path: "account",
    loadChildren: () =>
      import("smartstock-accounts").then((mod) => mod.AccountModule)
  },
  {
    path: "stock",
    canActivate: [AuthenticationGuard, ActiveShopGuard],
    loadChildren: () =>
      import("../../../stocks/src/public-api").then((mod) => mod.StocksModule)
  },
  {
    path: "dashboard",
    canActivate: [AuthenticationGuard, ActiveShopGuard],
    loadChildren: () =>
      import("../../../stocks/src/public-api").then((mod) => mod.StocksModule)
  }
];

@NgModule({
  declarations: [AppComponent, WelcomePage],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    HttpClientModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatBottomSheetModule,
    MatMenuModule,
    LibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private readonly syncService: SyncsService,
    private readonly stockService: StockService
  ) {
    syncService.startWorker().catch(console.log);
    stockService.compactStockQuantity().catch(console.log);
    init({
      applicationId: "smartstock_lb",
      projectId: "smartstock"
    });
  }
}
