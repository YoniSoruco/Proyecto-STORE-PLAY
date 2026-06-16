import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import posScannerReducer, {
  processScan,
  clearLastScan,
  clearError,
} from './posScannerSlice';
import { getProductByBarcode } from '@/api/products';
import { addItem } from './posCartSlice';
import type { Product } from '@/api/products';

vi.mock('@/api/products', () => ({
  getProductByBarcode: vi.fn(),
}));

describe('posScannerSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        posScanner: posScannerReducer,
      },
    });
    vi.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle clearLastScan', () => {
      store.dispatch({
        type: 'posScanner/processScan/fulfilled',
        payload: { barcode: '123' },
      });
      expect(store.getState().posScanner.lastScan).toBe('123');

      store.dispatch(clearLastScan());
      expect(store.getState().posScanner.lastScan).toBeNull();
      expect(store.getState().posScanner.feedback).toBeNull();
    });

    it('should handle clearError', () => {
      store.dispatch({
        type: 'posScanner/processScan/rejected',
        error: { message: 'Failed' },
      });
      expect(store.getState().posScanner.error).toBe('Failed');

      store.dispatch(clearError());
      expect(store.getState().posScanner.error).toBeNull();
    });
  });

  describe('processScan thunk', () => {
    const mockProduct: Product = {
      id: 1,
      name: 'Test Product',
      price: 100,
      priceWithIva: 121,
      cashPrice: 95,
      requiresExpiration: false,
      totalStock: 10,
      brand: null,
      description: null,
      minStock: 5,
      saleUnit: 'unit',
      active: true,
      categoryId: null,
      categoryName: null,
    };

    it('should process successful scan via API', async () => {
      vi.mocked(getProductByBarcode).mockResolvedValueOnce(mockProduct);

      const dispatchSpy = vi.spyOn(store, 'dispatch');
      await store.dispatch(processScan('123456789'));

      expect(getProductByBarcode).toHaveBeenCalledWith('123456789');
      
      const calls = dispatchSpy.mock.calls;
      const addItemCall: any = calls.find(
        (call: any) => call[0].type === addItem.type
      );
      
      expect(addItemCall).toBeTruthy();
      expect(addItemCall[0].payload).toEqual({
        productId: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
      });

      const state = store.getState().posScanner;
      expect(state.status).toBe('idle');
      expect(state.lastScan).toBe('123456789');
      expect(state.error).toBeNull();
      expect(state.feedback).toContain('Test Product');
    });

    it('should handle scan error via API', async () => {
      vi.mocked(getProductByBarcode).mockRejectedValueOnce(
        new Error('Product not found')
      );

      await store.dispatch(processScan('999999'));

      expect(getProductByBarcode).toHaveBeenCalledWith('999999');

      const state = store.getState().posScanner;
      expect(state.status).toBe('idle');
      expect(state.lastScan).toBe('999999');
      expect(state.error).toBe('Product not found');
      expect(state.feedback).toBeNull();
    });
  });
});
