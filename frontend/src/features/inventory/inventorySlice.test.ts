import { describe, it, expect } from 'vitest';
import inventoryReducer, { 
  type InventoryState, 
  fetchProducts, 
  addProduct, 
  searchProductByBarcode 
} from './inventorySlice';

const mockProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 1, name: 'Test', price: 10, barcode: '123',
  brand: null, description: null, costPrice: null,
  stock: 0, minStock: 0, saleUnit: 'unit', active: true,
  categoryId: null, categoryName: null,
  ...overrides,
});

describe('inventorySlice', () => {
  const initialState: InventoryState = {
    products: [],
    categories: [],
    loading: false,
    error: null,
    searchResult: null,
  };

  it('should return the initial state', () => {
    expect(inventoryReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should set loading to true when fetchProducts is pending', () => {
    const action = { type: fetchProducts.pending.type };
    const state = inventoryReducer(initialState, action);
    expect(state.loading).toBe(true);
  });

  it('should set products and loading to false when fetchProducts is fulfilled', () => {
    const products = [mockProduct()];
    const action = { type: fetchProducts.fulfilled.type, payload: products };
    const state = inventoryReducer({ ...initialState, loading: true }, action);
    expect(state.products).toEqual(products);
    expect(state.loading).toBe(false);
  });

  it('should add a new product when addProduct is fulfilled', () => {
    const newProduct = mockProduct({ id: 2, name: 'New Product', barcode: '456' });
    const action = { type: addProduct.fulfilled.type, payload: newProduct };
    const state = inventoryReducer(initialState, action);
    expect(state.products).toContainEqual(newProduct);
  });

  it('should set searchResult when searchProductByBarcode is fulfilled', () => {
    const product = mockProduct();
    const action = { type: searchProductByBarcode.fulfilled.type, payload: product };
    const state = inventoryReducer(initialState, action);
    expect(state.searchResult).toEqual(product);
  });

  it('should set error when fetchProducts is rejected', () => {
    const error = { message: 'Fetch failed' };
    const action = { type: fetchProducts.rejected.type, error };
    const state = inventoryReducer({ ...initialState, loading: true }, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Fetch failed');
  });
});
