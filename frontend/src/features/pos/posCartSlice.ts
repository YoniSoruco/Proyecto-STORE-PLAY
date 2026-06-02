import { createSlice, createAction, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { submitSale as submitSaleApi } from '@/api/sales';
import { fetchProducts } from '@/features/inventory/inventorySlice';

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
  checkoutLoading: boolean;
  checkoutError: string | null;
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
  checkoutLoading: false,
  checkoutError: null,
};

export const checkoutCart = createAction<{ items: CartItem[]; totals: CartTotals }>('posCart/checkoutCart');

export const submitSale = createAsyncThunk<void, { items: CartItem[]; totals: CartTotals }>(
  'posCart/submitSale',
  async ({ items, totals }, { dispatch, rejectWithValue }) => {
    try {
      await submitSaleApi(items, totals);
      dispatch(fetchProducts());
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error al procesar la venta';
      return rejectWithValue(msg);
    }
  },
);

const posCartSlice = createSlice({
  name: 'posCart',
  initialState,
  reducers: {
    clearCheckoutError(state) {
      state.checkoutError = null;
    },
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
      state.checkoutLoading = false;
      state.checkoutError = null;
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
  extraReducers: (builder) => {
    builder
      .addCase(submitSale.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(submitSale.fulfilled, (state) => {
        state.checkoutLoading = false;
        state.items = [];
        state.totals = { itemCount: 0, subtotal: 0, tax: 0, total: 0 };
      })
      .addCase(submitSale.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = (action.payload as string) || 'Error al procesar la venta';
      });
  },
});

export const { addItem, removeItem, clearCart, updateItemQuantity, clearCheckoutError } = posCartSlice.actions;
export default posCartSlice.reducer;
