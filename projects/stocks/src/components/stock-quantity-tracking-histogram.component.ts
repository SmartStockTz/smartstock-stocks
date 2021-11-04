import {Component, Input, OnInit} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {DeviceState} from '@smartstocktz/core-libs';
import {DatePipe} from '@angular/common';
import * as Highcharts from 'highcharts';
import {SeriesOptionsType} from 'highcharts';

@Component({
  selector: 'app-stock-quantity-histogram',
  template: `
    <div class="sqh-container">
      <div id="stockTracking" class="w-100"></div>
    </div>
  `,
  styleUrls: ['../styles/stock-quantity-histogram.style.scss'],
  providers: [
    DatePipe
  ]
})

export class StockQuantityTrackingHistogramComponent implements OnInit {
  @Input() stock: StockModel;

  constructor(public readonly deviceState: DeviceState,
              private readonly datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.initiateGraph(Object.values(this.stock.quantity));
  }

  private initiateGraph(data: { d: string, q: number, s: string }[]): any {
    const series: SeriesOptionsType[] = Object.values(data.reduce((a, b) => {
      if (a[b.s]) {
        a[b.s].name = b.s;
        a[b.s].data.push(b.q);
      } else {
        a[b.s] = {
          name: b.s,
          data: [b.q]
        };
      }
      return a;
    }, {}));
    // console.log(series);
    // const dates = [];
    // const totalSales = [];
    // data.forEach(value => {
    //   dates.push();
    //   totalSales.push(value.q);
    // });
    // @ts-ignore
    this.trendChart = Highcharts.chart('stockTracking', {
      chart: {
        type: 'column'
      },
      title: {
        text: null
      },
      xAxis: {
        // allowDecimals: false,
        visible: this.deviceState.isSmallScreen.value !== true,
        categories: data.map(x => this.datePipe.transform(x.d, 'dd MMM YYYY')),
        title: {
          text: 'Date'
        },
        labels: {
          formatter(): string {
            return this.value.toString();
          }
        }
      },
      yAxis: {
        visible: this.deviceState.isSmallScreen.value !== true,
        title: {
          text: 'Quantity'
        },
        // lineColor: '#1b5e20',
        labels: {
          formatter(): string {
            return this.value.toString();
          }
        }
      },
      tooltip: {
        valueDecimals: 2,
        pointFormat: 'Quantity of {series.name} <b>{point.y:,.0f}'
      },
      series
    }, _ => {
    });
  }
}
