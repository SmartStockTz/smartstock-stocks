import { Injectable } from "@angular/core";
import { getFaasAddress, SecurityUtil, UserService } from "smartstock-core";
import { cache, database, functions } from "bfast";
import { StockModel } from "../models/stock.model";
import { StockWorker } from "../workers/stock.worker";
import { wrap } from "comlink";
import { SocketController } from "bfast/dist/lib/controllers/socket.controller";

@Injectable({
  providedIn: "root"
})
export class StockService {
  private changes: SocketController;
  private isRunning = false;

  constructor(private readonly userService: UserService) {}

  private static async withWorker(
    fn: (stockWorker: StockWorker) => Promise<any>
  ): Promise<any> {
    let nativeWorker: Worker;
    try {
      nativeWorker = new Worker(
        new URL("../workers/stock.worker", import.meta.url)
      );
      const SW = (wrap(nativeWorker) as unknown) as any;
      const stWorker = await new SW();
      return await fn(stWorker);
    } finally {
      if (nativeWorker) {
        nativeWorker.terminate();
      }
    }
  }

  async stocksListeningStop(): Promise<void> {
    if (this.changes && this.changes.close) {
      this.changes.close();
    }
  }

  async stocksListening(): Promise<void> {
    const shop = await this.userService.getCurrentShop();
    this.changes = functions(shop.projectId).event(
      "/daas-changes",
      () => {
        console.log("connected on stocks changes");
        this.changes.emit({
          auth: { masterKey: shop.masterKey },
          body: {
            projectId: shop.projectId,
            applicationId: shop.applicationId,
            pipeline: [],
            domain: "stocks"
          }
        });
      },
      () => console.log("disconnected on stocks changes")
    );
    this.changes.listener(async (response) => {
      const stockCache = cache({
        database: shop.projectId,
        collection: "stocks"
      });
      if (response && response.body && response.body.change) {
        switch (response.body.change.name) {
          case "create":
            const data = response.body.change.snapshot;
            delete data.quantity;
            await stockCache.set(data.id, data);
            return;
          case "update":
            let updateData = response.body.change.snapshot;
            const oldData = await stockCache.get(updateData.id);
            updateData = Object.assign(
              typeof oldData === "object" ? oldData : {},
              updateData
            );
            delete updateData.quantity;
            await stockCache.set(updateData.id, updateData);
            return;
          case "delete":
            const deletedData = response.body.change.snapshot;
            await stockCache.remove(deletedData.id);
            return;
        }
      }
    });
  }

  async stocksFromLocal(): Promise<StockModel[]> {
    const activeShop = await this.userService.getCurrentShop();
    return cache({ database: activeShop.projectId, collection: "stocks" })
      .getAll()
      .then((stocks) => {
        if (Array.isArray(stocks) && stocks.length === 0) {
          return this.getProductsRemote();
        }
        if (Array.isArray(stocks) && stocks.length > 0) {
          return stocks;
        }
      });
  }

  async exportToExcel(): Promise<any> {
    const activeShop = await this.userService.getCurrentShop();
    const s = await this.stocksFromLocal();
    const csv = await StockService.withWorker((stockWorker) => {
      return stockWorker.export(s);
    });
    const csvContent = "data:text/csv;charset=utf-8," + csv;
    const url = encodeURI(csvContent);
    const anchor = document.createElement("a");
    anchor.setAttribute("style", "display: none");
    anchor.download = activeShop.businessName.concat("-stocks.csv").trim();
    anchor.href = url;
    anchor.click();
    return csv;
  }

  private mapStockQuantityFromNumberToObject(stock: StockModel): StockModel {
    const s = JSON.parse(JSON.stringify(stock));
    const q = s.quantity as number;
    s.quantity = {};
    s.quantity[SecurityUtil.generateUUID()] = {
      q,
      s: "manual",
      d: new Date().toISOString()
    };
    return s;
  }

  async importStocks(csv: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    let st = await StockService.withWorker((stockWorker) => {
      return stockWorker.prepareStockForImportFromCsv(csv);
    });
    st = st.map((x) => this.mapStockQuantityFromNumberToObject(x));
    await database(shop.projectId).table("stocks").save(st);
    await cache({ database: shop.projectId, collection: "stocks" }).setBulk(
      st.map((z) => z.id),
      st
    );
    return st;
  }

  async addStock(stock: StockModel): Promise<StockModel> {
    stock.id = stock.id ? stock.id : SecurityUtil.generateUUID();
    stock.createdAt = new Date().toISOString();
    stock.updatedAt = new Date().toISOString();
    stock = await this.mapStockQuantityFromNumberToObject(stock);
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId)
      .table("stocks")
      .query()
      .byId(stock.id)
      .updateBuilder()
      .upsert(true)
      .doc(stock)
      .update();
    // stock.quantity;
    cache({ database: shop.projectId, collection: "stocks" })
      .set(stock.id, stock)
      .catch(console.log);
    return stock;
  }

  async deleteStock(stock: StockModel): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId)
      .table("stocks")
      .query()
      .byId(stock.id)
      .delete();
    cache({ database: shop.projectId, collection: "stocks" })
      .remove(stock.id)
      .catch(console.log);
    return { id: stock.id };
  }

  async getProducts(): Promise<StockModel[]> {
    const products = await this.stocksFromLocal();
    return StockService.withWorker(async (stockWorker) => {
      return stockWorker.sort(products);
    });
  }

  async getProductsRemote(hard=true): Promise<StockModel[]> {
    const shop = await this.userService.getCurrentShop();
    const stockCache = cache({
      database: shop.projectId,
      collection: "stocks"
    });
    let hashes = [];
    if(hard===false){
      const st = await stockCache.getAll();
      hashes = await StockService.withWorker(async (stockWorker) => {
        return await stockWorker.localStocksHashes(st);
      });
    }
    const url = `/shop/${shop.projectId}/${shop.applicationId}/stock/products`;
  //  console.log(hashes);
    return functions(shop.projectId)
      .request(url)
      .post(hashes)
      .then(async (stocks: StockModel[]) => {
        // console.log(stocks);
        if(hard===true){
          await cache({
            database: shop.projectId,
            collection: "stocks"
          }).clearAll();
        }
        await stockCache.setBulk(
          stocks.map((s) => s.id),
          stocks
        );
        const stok = await stockCache.getAll();
        return StockService.withWorker(async (stockWorker) =>
          stockWorker.sort(stok)
        );
      });
  }

  async maybeRefreshStocks() {
    const shop = await this.userService.getCurrentShop();
    const stockCache = cache({
      database: shop.projectId,
      collection: "stocks"
    });
    const stocks = await stockCache.getAll();
    const a = await StockService.withWorker(async (stockWorker)=>{
     return await stockWorker.hasProductsChanges(shop,stocks);
    });
    console.log(a);
    if(a && a.a===1){
      await this.getProductsRemote(false);
    }
  }

  async deleteMany(stocksId: string[]): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    await database(shop.projectId)
      .table("stocks")
      .query()
      .includesIn("_id", stocksId)
      .delete();
    for (const k of stocksId) {
      await cache({ database: shop.projectId, collection: "stocks" }).remove(k);
    }
    return this.getProducts();
  }

  async search(query: string): Promise<any> {
    const s = await this.getProducts();
    return StockService.withWorker((stockWorker) =>
      stockWorker.search(query, s)
    );
  }

  async getProduct(id: string): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return cache({ database: shop.projectId, collection: "stocks" })
      .get(id)
      .then((stock) => {
        if (stock) {
          return stock;
        }
        return database(shop.projectId).table("stocks").get(id);
      });
  }

  async compactStockQuantity(): Promise<any> {
    console.log("start compact is running");
    return setInterval(async (_) => {
      try {
        if (this.isRunning === true) {
          console.log("another compact is running");
          return;
        }
        this.isRunning = true;
        console.log("compact stock quantity now");
        const shop = await this.userService.getCurrentShop();
        await StockService.withWorker((stockWorker) =>
          stockWorker.compactQuantity(shop)
        );
      } catch (e) {
        console.log(e, " :COMPACT ERROR");
      } finally {
        this.isRunning = false;
        console.log("compact is finish");
      }
    }, 120000);
  }

  async positiveStockValue(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockValue(shop);
    });
  }

  async positiveStockItems(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockItems(shop);
    });
  }

  async positiveStockRetail(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockRetail(shop);
    });
  }

  async positiveStockWhole(): Promise<number> {
    const shop = await this.userService.getCurrentShop();
    return StockService.withWorker(async (stockWorker) => {
      return await stockWorker.positiveStockWhole(shop);
    });
  }


  async getProductQuantityObject(stockId): Promise<any> {
    const shop = await this.userService.getCurrentShop();
    return database(shop.projectId)
      .table("stocks")
      .get(stockId, {
        returnFields: ["quantity"]
      });
  }
}
