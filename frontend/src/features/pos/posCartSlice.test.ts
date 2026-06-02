import { describe, it, expect } from 'vitest';
import posCartReducer, {
  addItem,
  removeItem,
  clearCart,
  type PosCartState,
} from './posCartSlice';

describe('posCartSlice', () => {
  const initialState: PosCartState = {
    items: [],
    totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 },
    checkoutLoading: false,
    checkoutError: null,
  };

  it('should return the initial state', () => {
    expect(posCartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('addItem', () => {
    it('should add a unique product to the cart', () => {
      const state = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'Product A', price: 10, quantity: 2 }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        productId: 1,
        name: 'Product A',
        price: 10,
        quantity: 2,
      });
    });

    it('should merge quantity when product already exists', () => {
      const stateWithItem = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'Product A', price: 10, quantity: 1 }),
      );
      const state = posCartReducer(
        stateWithItem,
        addItem({ productId: 1, name: 'Product A', price: 10, quantity: 3 }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(4);
    });

    it('should default quantity to 1 when not provided', () => {
      const state = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'Product A', price: 10 }),
      );
      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('should remove an existing item by productId', () => {
      const withItems = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'A', price: 10 }),
      );
      const withTwo = posCartReducer(
        withItems,
        addItem({ productId: 2, name: 'B', price: 5 }),
      );
      const state = posCartReducer(withTwo, removeItem(1));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe(2);
    });

    it('should not change state when removing non-existent productId', () => {
      const withItem = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'A', price: 10 }),
      );
      const state = posCartReducer(withItem, removeItem(999));
      expect(state.items).toHaveLength(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items and reset totals', () => {
      const withItem = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'A', price: 10, quantity: 2 }),
      );
      const state = posCartReducer(withItem, clearCart());
      expect(state.items).toHaveLength(0);
      expect(state.totals).toEqual({ itemCount: 0, subtotal: 0, tax: 0, total: 0 });
    });
  });

  describe('totals computation', () => {
    it('should compute totals for multiple items', () => {
      let state = posCartReducer(
        initialState,
        addItem({ productId: 1, name: 'A', price: 10, quantity: 1 }),
      );
      state = posCartReducer(
        state,
        addItem({ productId: 2, name: 'B', price: 5, quantity: 2 }),
      );
      expect(state.totals.itemCount).toBe(3);
      expect(state.totals.subtotal).toBe(20);
      expect(state.totals.tax).toBe(1.6);
      expect(state.totals.total).toBe(21.6);
    });

    it('should display 0.00 for all totals when cart is empty', () => {
      expect(initialState.totals.subtotal).toBe(0);
      expect(initialState.totals.tax).toBe(0);
      expect(initialState.totals.total).toBe(0);
    });
  });
});
