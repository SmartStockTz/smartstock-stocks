import { Component, OnInit } from "@angular/core";
import { DeviceState } from "smartstock-core";

@Component({
  selector: "app-stocks-index",
  templateUrl: './index.html',
  styleUrls: ["../styles/index.style.scss"]
})
export class IndexPage implements OnInit {
  constructor(
    public readonly deviceState: DeviceState
  ) {
    document.title = "SmartStock - Stocks";
  }

  async ngOnInit(): Promise<void> {
  }
}
