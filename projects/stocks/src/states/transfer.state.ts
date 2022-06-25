import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TransferService } from "../services/transfer.service";
import { MessageService } from "smartstock-core";
import { TransferModel } from "../models/transfer.model";
import { Router } from "@angular/router";
import { TransferHeader } from "../models/transfer-header";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root"
})
export class TransferState {
  totalTransfersItems = new BehaviorSubject<number>(0);
  transfers = new BehaviorSubject<TransferModel[]>([]);
  isFetchTransfers = new BehaviorSubject<boolean>(false);
  isSaveTransfers = new BehaviorSubject<boolean>(false);
  addTransferProgress = new BehaviorSubject(false);
  searchProductProgress = new BehaviorSubject(false);
  toShopProductResults = new BehaviorSubject([]);

  constructor(
    private readonly transferService: TransferService,
    private readonly router: Router,
    private readonly snack: MatSnackBar
  ) {}

  countAll(): void {
    this.transferService
      .countAll()
      .then((value) => {
        this.totalTransfersItems.next(value);
      })
      .catch((_) => {});
  }

  fetch(size: number, skip: number): void {
    this.isFetchTransfers.next(true);
    this.transferService
      .fetch({
        skip,
        size
      })
      .then((value) => {
        this.transfers.next(value ? value : []);
      })
      .catch((reason) => {
        this.snack.open(
          reason && reason.message ? reason.message : reason.toString(),
          "Ok",
          {
            duration: 2000
          }
        );
      })
      .finally(() => {
        this.isFetchTransfers.next(false);
      });
  }

  save(transfer: TransferModel): void {
    this.addTransferProgress.next(true);
    this.transferService
      .save(transfer)
      .then((_87) => {
        this.transfers.value.unshift(transfer);
        this.router.navigateByUrl("/stock/transfers").catch();
      })
      .catch((reason) => {
        this.snack.open(
          reason && reason.message ? reason.message : reason.toString(),
          "Ok",
          {
            duration: 2000
          }
        );
      })
      .finally(() => {
        this.addTransferProgress.next(false);
      });
  }

  dispose(): void {
    this.toShopProductResults.next([]);
    this.totalTransfersItems.next(0);
    this.transfers.next([]);
    this.isFetchTransfers.next(false);
    this.isSaveTransfers.next(false);
    this.addTransferProgress.next(false);
  }

  searchToShopProduct(transferHeader: TransferHeader, q: string): void {
    this.searchProductProgress.next(true);
    this.transferService
      .searchProduct(transferHeader, q)
      .then((value) => {
        this.toShopProductResults.next(value);
      })
      .catch((reason) => {
        this.snack.open(
          reason && reason.message ? reason.message : reason.toString(),
          "Ok",
          {
            duration: 2000
          }
        );
      })
      .finally(() => {
        this.searchProductProgress.next(false);
      });
  }
}
