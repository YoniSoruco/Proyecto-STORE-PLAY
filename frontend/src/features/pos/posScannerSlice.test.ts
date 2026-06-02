import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import posScannerReducer, {
  setScannerStatus,
  scanDetected,
  setError,
  clearError,
  clearFeedback,
  processScan,
  type PosScannerState,
} from './posScannerSlice';

vi.mock('@/api/products', () => ({
  getProductByBarcode: vi.fn(),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('posScannerSlice', () => {
  const initialState: PosScannerState = {
    status: 'idle',
    lastScan: null,
    feedback: null,
    error: null,
  };

  it('should return the initial state', () => {
    expect(posScannerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setScannerStatus', () => {
    it('should transition status to requesting', () => {
      const state = posScannerReducer(initialState, setScannerStatus('requesting'));
      expect(state.status).toBe('requesting');
    });

    it('should transition status to active and clear error', () => {
      const withError = { ...initialState, error: 'Some error' };
      const state = posScannerReducer(withError, setScannerStatus('active'));
      expect(state.status).toBe('active');
      expect(state.error).toBeNull();
    });
  });

  describe('scanDetected', () => {
    const now = Date.now();

    it('should set lastScan for a new scan', () => {
      const scan = { barcode: '8901234567890', source: 'camera' as const, scannedAt: now };
      const state = posScannerReducer(initialState, scanDetected(scan));
      expect(state.lastScan).toEqual(scan);
    });

    it('should suppress duplicate scan within 2 seconds', () => {
      const firstScan = { barcode: '8901234567890', source: 'camera' as const, scannedAt: now };
      const afterFirst = posScannerReducer(initialState, scanDetected(firstScan));

      const secondScan = { barcode: '8901234567890', source: 'camera' as const, scannedAt: now + 1000 };
      const state = posScannerReducer(afterFirst, scanDetected(secondScan));
      expect(state.lastScan).toEqual(firstScan);
    });

    it('should allow same barcode after 2 seconds have passed', () => {
      const firstScan = { barcode: '8901234567890', source: 'camera' as const, scannedAt: now };
      const afterFirst = posScannerReducer(initialState, scanDetected(firstScan));

      const laterScan = { barcode: '8901234567890', source: 'camera' as const, scannedAt: now + 2500 };
      const state = posScannerReducer(afterFirst, scanDetected(laterScan));
      expect(state.lastScan).toEqual(laterScan);
    });

    it('should allow different barcodes regardless of timing', () => {
      const firstScan = { barcode: '8901234567890', source: 'camera' as const, scannedAt: now };
      const afterFirst = posScannerReducer(initialState, scanDetected(firstScan));

      const differentScan = { barcode: '1234567890123', source: 'manual' as const, scannedAt: now + 500 };
      const state = posScannerReducer(afterFirst, scanDetected(differentScan));
      expect(state.lastScan).toEqual(differentScan);
    });

    it('should clear error on a new scan', () => {
      const withError = { ...initialState, error: 'Some error', lastScan: null };
      const scan = { barcode: '8901234567890', source: 'manual' as const, scannedAt: now };
      const state = posScannerReducer(withError, scanDetected(scan));
      expect(state.error).toBeNull();
    });
  });

  describe('clearFeedback', () => {
    it('should clear feedback message', () => {
      const withFeedback = { ...initialState, feedback: { message: 'Agregado: Test', severity: 'success' as const } };
      const state = posScannerReducer(withFeedback, clearFeedback());
      expect(state.feedback).toBeNull();
    });
  });

  describe('processScan', () => {
    const foundProduct = { id: 1, name: 'Test Product', price: 10, barcode: '8901234567890',
      brand: null, description: null, costPrice: null,
      stock: 0, minStock: 0, saleUnit: 'unit', active: true,
      categoryId: null, categoryName: null };

    it('should find product in local inventory state first', async () => {
      const store = configureStore({
        reducer: {
          posScanner: posScannerReducer,
          inventory: () => ({ products: [foundProduct], categories: [], loading: false, error: null, searchResult: null }),
          posCart: (s = { items: [], totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 } }) => s,
        },
      });
      await store.dispatch(processScan({ barcode: '8901234567890', source: 'manual' }));

      const state = store.getState().posScanner;
      expect(state.feedback).toEqual({ message: 'Agregado: Test Product', severity: 'success' });
    });

    it('should fall back to API call when product not in local state', async () => {
      const { getProductByBarcode } = await import('@/api/products');
      vi.mocked(getProductByBarcode).mockResolvedValue(foundProduct);

      const store = configureStore({
        reducer: {
          posScanner: posScannerReducer,
          inventory: () => ({ products: [], categories: [], loading: false, error: null, searchResult: null }),
          posCart: (s = { items: [], totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 } }) => s,
        },
      });
      await store.dispatch(processScan({ barcode: '8901234567890', source: 'manual' }));

      const state = store.getState().posScanner;
      expect(state.feedback).toEqual({ message: 'Agregado: Test Product', severity: 'success' });
    });

    it('should set warning feedback when product is not found anywhere', async () => {
      const { getProductByBarcode } = await import('@/api/products');
      vi.mocked(getProductByBarcode).mockRejectedValue(new Error('Not found'));

      const store = configureStore({
        reducer: {
          posScanner: posScannerReducer,
          inventory: () => ({ products: [], categories: [], loading: false, error: null, searchResult: null }),
          posCart: (s = { items: [], totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 } }) => s,
        },
      });
      await store.dispatch(processScan({ barcode: '0000000000000', source: 'manual' }));

      const state = store.getState().posScanner;
      expect(state.feedback).toEqual({ message: 'Producto no encontrado', severity: 'warning' });
    });
  });

  describe('setError / clearError', () => {
    it('should set an error message', () => {
      const state = posScannerReducer(initialState, setError('Camera denied'));
      expect(state.error).toBe('Camera denied');
    });

    it('should clear the error message', () => {
      const withError = { ...initialState, error: 'Some error' };
      const state = posScannerReducer(withError, clearError());
      expect(state.error).toBeNull();
    });
  });
});
