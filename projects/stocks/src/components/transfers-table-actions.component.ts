import {Component, OnInit} from '@angular/core';
import {TransferState} from '../states/transfer.state';
import {MatDialog} from '@angular/material/dialog';
import {TransferHeaderDialog} from './transfer-header-dialog';
import {firstValueFrom} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-stock-transfers-table-actions',
  template: `
    <div class="table-options-container">
      <div class="table-options">
        <button (click)="transferDialog()" color="primary" class="menu-button" mat-button>
          Create
        </button>
        <button (click)="transferState.fetch(50,0)"
                [disabled]="(transferState.isFetchTransfers | async) === true"
                color="primary"
                class="menu-button" mat-button>
          Reload
        </button>
        <span class="toolbar-spacer"></span>
      </div>
      <mat-progress-bar mode="indeterminate" color="primary"
                        *ngIf="(transferState.isFetchTransfers | async)===true"></mat-progress-bar>
    </div>
  `,
  styleUrls: ['../styles/index.style.scss']
})

export class TransfersTableActionsComponent {

  constructor(public readonly transferState: TransferState,
              private readonly router: Router,
              private readonly matDialog: MatDialog) {
  }

  transferDialog(): void {
    const obs = this.matDialog.open(TransferHeaderDialog, {
      width: '500px',
      closeOnNavigation: true
    }).afterClosed();
    firstValueFrom(obs).then(value => {
      if (value && value.to_shop) {
        this.router
          .navigateByUrl('/stock/transfers/create?data=' + encodeURIComponent(JSON.stringify(value)))
          .catch(console.log);
      }
    });
  }
}








