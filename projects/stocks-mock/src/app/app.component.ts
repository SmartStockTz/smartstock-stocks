import {Component, OnInit} from '@angular/core';
import {StorageService} from '@smartstocktz/core-libs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor() {
  }

  async ngOnInit(): Promise<void> {
  }

}
