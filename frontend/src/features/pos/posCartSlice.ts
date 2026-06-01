import { createSlice, createAction, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PosCartState {
  items: CartItem[];
  totals: CartTotals;
}

const TAX_RATE = 0.08;

function computeTotals(items: CartItem[]): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));
  return { itemCount, subtotal, tax, total };
}

const initialState: PosCartState = {
  items: [],
  totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 },
};

export const checkoutCart = createAction<{ items: CartItem[]; totals: CartTotals }>('posCart/checkoutCart');

const posCartSlice = createSlice({
  name: 'posCart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) {
      const { productId, name, price, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ productId, name, price, quantity });
      }
      state.totals = computeTotals(state.items);
    },
    removeItem(state, action: PayloadAction<number>) {
      const index = state.items.findIndex((item) => item.productId === action.payload);
      if (index !== -1) {
        state.items.splice(index, 1);
        state.totals = computeTotals(state.items);
      }
    },
    clearCart(state) {
      state.items = [];
      state.totals = { itemCount: 0, subtotal: 0, tax: 0, total: 0 };
    },
    updateItemQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        const index = state.items.findIndex((item) => item.productId === productId);
        if (index !== -1) {
          state.items.splice(index, 1);
        }
      } else {
        const item = state.items.find((item) => item.productId === productId);
        if (item) {
          item.quantity = quantity;
        }
      }
      state.totals = computeTotals(state.items);
    },
  },
});

export const { addItem, removeItem, clearCart, updateItemQuantity } = posCartSlice.actions;
export default posCartSlice.reducer;
