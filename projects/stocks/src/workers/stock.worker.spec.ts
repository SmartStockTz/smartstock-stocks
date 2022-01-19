import {StockWorker} from './stock.worker';

describe('StockWorker', () => {
  const stockWorker = new StockWorker();
  describe('#prepareStockForImportFromCsv', () => {
    it('should import stocks if csv is valid', async () => {
      const csv = 'product,quantity,retailPrice,wholesalePrice\ntest,10,1000,1000';
      const stocks = await stockWorker.prepareStockForImportFromCsv(csv);
      expect(stocks[0].id).toBeTruthy();
      expect(stocks[0].createdAt).toBeTruthy();
      expect(stocks[0].updatedAt).toBeTruthy();
      delete stocks[0].id;
      delete stocks[0].createdAt;
      delete stocks[0].updatedAt;
      expect(stocks).toEqual([
        // @ts-ignore
        {
          product: 'test', quantity: 10, retailPrice: 1000, wholesalePrice: 1000,
          saleable: true, purchasable: true, stockable: true, canExpire: false, downloadable: false
        }
      ]);
    });
    it('should return empty array if cvs is not proper formatted', async () => {
      const csv = 'product,quantity,retailPrice,wholesalePrice\ntest,10,1000,1000,9';
      const stocks = await stockWorker.prepareStockForImportFromCsv(csv);
      expect(stocks).toEqual([]);
    });
    it('should return empty array if cvs string is empty', async () => {
      const csv = '';
      const stocks = await stockWorker.prepareStockForImportFromCsv(csv);
      expect(stocks).toEqual([]);
    });
    it('should fail if csv is not valid', async () => {
      try {
        const csv = 9;
        // @ts-ignore
        await stockWorker.prepareStockForImportFromCsv(csv);
      } catch (e) {
        expect(e).toEqual({message: 'csv must be a string with , delimiter'});
      }
    });
  });
  describe('#search', () => {
    it('should return matched stocks', async () => {
      // @ts-ignore
      const result = await stockWorker.search('xp', [{product: 'xps dell'}]);
      expect(result[0].product).toEqual('xps dell');
    });
    it('should return empty stocks if not matched', async () => {
      // @ts-ignore
      const result = await stockWorker.search('xps kali sana', [{product: 'xps dell'}]);
      expect(result).toEqual([]);
    });
  });
});
