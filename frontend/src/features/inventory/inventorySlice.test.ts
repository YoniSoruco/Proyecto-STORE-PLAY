import { describe, it, expect, vi } from 'vitest';
import inventoryReducer, {
  fetchProducts,
  addProduct,
  removeProduct,
  updateExistingProduct,
} from './inventorySlice';
import type { Product } from '@/api/products';
import type { InventoryState } from './inventorySlice';

vi.mock('@/api/products');

describe('inventorySlice', () => {
  const initialState: InventoryState = {
    products: [],
    categories: [],
    suppliers: [],
    batches: {},
    dashboard: null,
    loading: false,
    error: null,
    searchResult: null,
  };

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

  it('should return initial state', () => {
    expect(inventoryReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('fetchProducts', () => {
    it('handles pending state', () => {
      const state = inventoryReducer(initialState, { type: fetchProducts.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('handles fulfilled state', () => {
      const state = inventoryReducer(initialState, {
        type: fetchProducts.fulfilled.type,
        payload: [mockProduct],
      });
      expect(state.loading).toBe(false);
      expect(state.products).toEqual([mockProduct]);
    });
  });

  describe('addProduct', () => {
    it('handles fulfilled state', () => {
      const state = inventoryReducer(initialState, {
        type: addProduct.fulfilled.type,
        payload: mockProduct,
      });
      expect(state.products).toContainEqual(mockProduct);
    });
  });

  describe('removeProduct', () => {
    it('handles fulfilled state', () => {
      const stateWithProduct = { ...initialState, products: [mockProduct] };
      const state = inventoryReducer(stateWithProduct, {
        type: removeProduct.fulfilled.type,
        payload: mockProduct.id,
      });
      expect(state.products).toHaveLength(0);
    });
  });

  describe('updateExistingProduct', () => {
    it('handles fulfilled state', () => {
      const stateWithProduct = { ...initialState, products: [mockProduct] };
      const updatedProduct = { ...mockProduct, name: 'Updated' };
      const state = inventoryReducer(stateWithProduct, {
        type: updateExistingProduct.fulfilled.type,
        payload: updatedProduct,
      });
      expect(state.products[0].name).toBe('Updated');
    });
  });
});
