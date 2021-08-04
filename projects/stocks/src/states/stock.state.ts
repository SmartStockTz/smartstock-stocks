import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {StockModel} from '../models/stock.model';
import {StockService} from '../services/stock.service';
import {MatDialogRef} from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'any'
})
export class StockState {

  stocks: BehaviorSubject<StockModel[]> = new BehaviorSubject<StockModel[]>([]);
  selectedStock: BehaviorSubject<StockModel> = new BehaviorSubject<StockModel>(null);
  isFetchStocks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isExportToExcel: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isImportProducts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isDeleteStocks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  totalValidStocks: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  isSearchProducts = new BehaviorSubject(false);
  totalValueOfStocks: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  selection = new SelectionModel(true, []);

  constructor(private readonly stockService: StockService,
              private readonly snack: MatSnackBar) {
  }

  getStocks(): void {
    this.isFetchStocks.next(true);
    this.stockService.getProducts().then(localStocks => {
      if (localStocks && Array.isArray(localStocks) && localStocks.length > 0) {
        this.stocks.next(localStocks);
      }
    }).catch(this.message).finally(() => {
      this.isFetchStocks.next(false);
    });
  }

  private _updateTotalAvailableStocks(total: number): void {
    this.totalValidStocks.next(total);
  }

  private _updateStocksValue(total: number): void {
    this.totalValueOfStocks.next(total);
  }

  getStocksSummary(): void {
    this.isFetchStocks.next(true);
    this.stockService.getProducts().then(localStocks => {
      if (localStocks && Array.isArray(localStocks) && localStocks.length > 0) {
        this._updateTotalAvailableStocks(localStocks.length);
        this._updateStocksValue(localStocks.map(x => {
          if (x.quantity > 0) {
            return x.quantity * x.purchase;
          } else {
            return 0;
          }
        }).reduce((a, b) => a + b, 0));
      }
    }).catch(this.message).finally(() => {
      this.isFetchStocks.next(false);
    });
  }

  getStocksFromRemote(): void {
    this.isFetchStocks.next(true);
    this.stockService.getProductsRemote().then(remoteStocks => {
      this.stocks.next(remoteStocks);
    }).catch(this.message).finally(() => {
      this.isFetchStocks.next(false);
    });
  }

  exportToExcel(): void {
    this.isExportToExcel.next(true);
    this.stockService.exportToExcel().then(_ => {
      this.message('Stocks exported');
    }).catch(this.message).finally(() => {
      this.isExportToExcel.next(false);
    });
  }

  importProducts(csv: string, dialog: MatDialogRef<any>): void {
    this.isImportProducts.next(true);
    this.stockService.importStocks(csv).then(_ => {
      dialog.close(true);
      // this.getStocks();
      this.message('Products imported');
    }).catch(this.message).finally(() => {
      this.isImportProducts.next(false);
    });
  }

  deleteStock(stock: StockModel): void {
    this.isFetchStocks.next(true);
    this.stockService.deleteStock(stock).then(_ => {
      return this.stockService.getProducts();
    }).then(stocks => {
      this.stocks.next(stocks);
      this.message('Product deleted');
    }).catch(this.message).finally(() => {
      this.isFetchStocks.next(false);
    });
  }

  filter(query: string): void {
    this.isSearchProducts.next(true);
    this.stockService.search(query).then(stocks => {
      this.stocks.next(stocks);
    }).catch(this.message).finally(() => {
      this.isSearchProducts.next(false);
    });
  }

  deleteManyStocks(selectionModel: SelectionModel<StockModel>): void {
    this.isDeleteStocks.next(true);
    this.stockService.deleteMany(selectionModel.selected.map(x => x.id)).then(_ => {
      this.message('Products deleted');
      this.stocks.next(_);
      selectionModel.clear();
    }).catch(reason => {
      this.message(reason);
    }).finally(() => {
      this.isDeleteStocks.next(false);
    });
  }

  private message(reason): void {
    this.snack.open(reason && reason.message ? reason.message : reason.toString(), 'Ok', {
      duration: 2000
    });
  }

  async getStock(id: string): Promise<StockModel> {
    return this.stockService.getProduct(id);
  }
}
