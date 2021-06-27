import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TransferService} from '../services/transfer.service';
import {MessageService} from '@smartstocktz/core-libs';
import {TransferModel} from '../models/transfer.model';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'any'
})

export class TransferState {
  constructor(private readonly transferService: TransferService,
              private readonly router: Router,
              private readonly messageService: MessageService) {
  }

  totalTransfersItems: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  transfers: BehaviorSubject<TransferModel[]> = new BehaviorSubject<TransferModel[]>([]);
  isFetchTransfers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSaveTransfers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  countAll(): void {
    this.transferService.countAll().then(value => {
      this.totalTransfersItems.next(value);
    }).catch(_ => {

    });
  }

  fetch(size: number, skip: number): void {
    this.isFetchTransfers.next(true);
    this.transferService.fetch({
      skip,
      size
    }).then(value => {
      this.transfers.next(value ? value : []);
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(reason && reason.message ? reason.message : reason.toString(), 2000, 'bottom');
    }).finally(() => {
      this.isFetchTransfers.next(false);
    });
  }

  save(transfer: TransferModel): void {
    this.isSaveTransfers.next(true);
    this.transferService.save(transfer).then(value => {
      this.transfers.value.unshift(transfer);
      this.router.navigateByUrl('/stock/transfers').catch();
    }).catch(reason => {
      this.messageService.showMobileInfoMessage(reason && reason.message ? reason.message : reason.toString(),
        2000, 'bottom');
    }).finally(() => {
      this.isSaveTransfers.next(false);
    });
  }
}
