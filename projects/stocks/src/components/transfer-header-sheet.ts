import {Component} from '@angular/core';

@Component({
  selector: 'app-transfer-header-sheet',
  template: `
    <div class="sheet-container">
      <app-transfer-header-form></app-transfer-header-form>
    </div>
  `,
  styleUrls: ['../styles/transfer-head.scss']
})
export class TransferHeaderSheet {
  constructor() {
  }
}
