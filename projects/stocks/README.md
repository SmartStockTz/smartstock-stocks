# Smartstock Core Stocks

Angular2 library that provides stock module to be used across smartstock


## Peer Dependencies

Please refer to `package.json>peerDependencies` to see a list of the dependecies
you need to install in your project

## Installation

Install the latest dependencies from npm `npm install --save @smartstocktz/stocks --registry=https://npm.pkg.github.com`

## Usages

To use this library include it at `imports` section of your angular module. Example

```typescript


// imports
import {StockModule} from '@smartstocktz/stocks';

@NgModule({
// ....
  imports: [
    StockModule
  ],
// ....
})
export class AppModule { }

```

