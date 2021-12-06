import {Component} from '@angular/core';

@Component({
  selector: 'app-stock-transfer-desktop-ux',
  template: `
    <app-stock-transfers-table-actions></app-stock-transfers-table-actions>
    <app-stock-transfers-table></app-stock-transfers-table>
  `,
  styleUrls: []
})
export class TransferDesktopUx {
  constructor() {
  }
}
