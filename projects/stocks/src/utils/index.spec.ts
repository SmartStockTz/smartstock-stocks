import {getProductFromTransferProduct, getStockQuantity} from './util';

describe('Utils', () => {
  describe('getStockQuantity', () => {
    it('should convert from stock map to quantity', () => {
      const stock: any = {
        quantity: {
          initial: {
            q: 10,
            s: 'initial',
            d: '2022-01-01'
          }
        }
      };
      const q = getStockQuantity(stock);
      expect(q).toBe(10);
    });
    it('should return quantity if is already a number', () => {
      const stock: any = {quantity: 20};
      const q = getStockQuantity(stock);
      expect(q).toBe(20);
    });
    it('should return 0 if quantity field in stock not available', () => {
      const stock: any = {quantity: 20};
      const q = getStockQuantity(stock);
      expect(q).toBe(20);
    });
  });
  describe('getProductFromTransferProduct', () => {
    it('should return the string if value is string', () => {
      expect(getProductFromTransferProduct('xps')).toBe('xps');
    });
    it('should return the product field if value is object', () => {
      expect(getProductFromTransferProduct({product: 'xps'})).toBe('xps');
    });
    it('should throw error if otherwise', () => {
      try {
        getProductFromTransferProduct(1);
      } catch (e) {
        expect(e).toEqual({message: 'value must be string or object with product field'});
      }
    });
  });
});
