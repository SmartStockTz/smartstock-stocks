import {Component, Input, OnInit} from '@angular/core';
import {StockModel} from '../models/stock.model';
import {DeviceState} from 'smartstock-core';
import {DatePipe} from '@angular/common';
import * as Highcharts from 'highcharts/highstock';
import HC_stock from 'highcharts/modules/stock';
import HC_access from 'highcharts/modules/accessibility';
import HC_exp from 'highcharts/modules/exporting';

HC_stock(Highcharts);
HC_access(Highcharts);
HC_exp(Highcharts);

@Component({
  selector: 'app-stock-quantity-histogram',
  template: `
    <div class="sqh-container">
      <div id="stockTracking" class="w-100"></div>
    </div>
  `,
  styleUrls: ['../styles/stock-quantity-histogram.style.scss'],
  providers: [DatePipe]
})
export class StockQuantityTrackingHistogramComponent implements OnInit {
  @Input() stock: StockModel;
  @Input() data: any[];

  constructor(
    public readonly deviceState: DeviceState,
    private readonly datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.initiateGraph(this.data);
  }

  private initiateGraph(data: { d: string; q: number; s: string }[]): any {
    // const series: SeriesOptionsType[] = Object.values(
    //   data.reduce((a, b) => {
    //     if (a[b.s]) {
    //       a[b.s].name = b.s;
    //       a[b.s].data.push(b.q);
    //     } else {
    //       a[b.s] = {
    //         name: b.s,
    //         data: [b.q]
    //       };
    //     }
    //     return a;
    //   }, {})
    // );
    // console.log(series);
    // const dates = [];
    // const totalSales = [];
    // data.forEach(value => {
    //   dates.push();
    //   totalSales.push(value.q);
    // });
    // @ts-ignore
    // this.trendChart = Highcharts.chart(
    //   'stockTracking',
    //   {
    //     chart: {
    //       type: 'column'
    //     },
    //     title: {
    //       text: null
    //     },
    //     xAxis: {
    //       // allowDecimals: false,
    //       visible: this.deviceState.isSmallScreen.value !== true,
    //       categories: data.map((x) =>
    //         this.datePipe.transform(x.d, 'dd MMM YYYY')
    //       ),
    //       title: {
    //         text: 'Date'
    //       },
    //       labels: {
    //         formatter(): string {
    //           return this.value.toString();
    //         }
    //       }
    //     },
    //     yAxis: {
    //       visible: this.deviceState.isSmallScreen.value !== true,
    //       title: {
    //         text: 'Quantity'
    //       },
    //       // lineColor: '#1b5e20',
    //       labels: {
    //         formatter(): string {
    //           return this.value.toString();
    //         }
    //       }
    //     },
    //     tooltip: {
    //       valueDecimals: 2,
    //       pointFormat: 'Quantity of {series.name} <b>{point.y:,.0f}'
    //     },
    //     series
    //   },
    //   (_) => {}
    // );

    // @ts-ignore
    // Highcharts.getJSON('https://smartstock-faas.b
    // fast.fahamutech.com/shop/lbpharmacy/lbpharmacy/stock/products/Pan
    // adol_advance_500mg_tab_pcm__KENYA_/quantity?from=2022-09-01&to=2022-09-30', function(data) {

    // create the chart
    Highcharts.stockChart(
      'stockTracking', {
        rangeSelector: {
          selected: 1
        },

        title: {
          text: ''
        },

        series: [{
          type: 'candlestick',
          name: 'Movements',
          data: this.data,
          dataGrouping: {
            units: [
              [
                'week', // unit name
                [1] // allowed multiples
              ],
              [
                'month',
                [1, 2, 3, 4, 6]
              ]
            ]
          }
        }]
      }
    );
    // });
  }
}
