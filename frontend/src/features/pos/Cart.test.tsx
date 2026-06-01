import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import Cart from './Cart';
import posCartReducer, { type PosCartState } from './posCartSlice';

const defaultPosCart: PosCartState = {
  items: [],
  totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 },
};

interface RootState { posCart: PosCartState; }

const rootReducer = combineReducers({ posCart: posCartReducer });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMockStore(preloaded?: Partial<RootState>): any {
  const state: RootState = { posCart: { ...defaultPosCart, ...preloaded?.posCart } };
  return createStore(rootReducer, state as any);
}

function renderWithStore(store: ReturnType<typeof createMockStore>) {
  return render(
    <Provider store={store}>
      <Cart />
    </Provider>,
  );
}

describe('Cart', () => {
  it('should show empty cart message when no items', () => {
    const store = createMockStore();
    renderWithStore(store);
    expect(screen.getByText('El carrito está vacío.')).toBeInTheDocument();
  });

  it('should have checkout button disabled when cart is empty', () => {
    const store = createMockStore();
    renderWithStore(store);
    const btn = screen.getByRole('button', { name: /cobrar/i });
    expect(btn).toBeDisabled();
  });

  it('should render items from the store', () => {
    const store = createMockStore({
      posCart: {
        items: [
          { productId: 1, name: 'Test Product', price: 10, quantity: 2 },
        ],
        totals: { itemCount: 2, subtotal: 20, tax: 1.6, total: 21.6 },
      },
    });
    renderWithStore(store);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display totals', () => {
    const store = createMockStore({
      posCart: {
        items: [
          { productId: 1, name: 'A', price: 10, quantity: 1 },
          { productId: 2, name: 'B', price: 5, quantity: 2 },
        ],
        totals: { itemCount: 3, subtotal: 20, tax: 1.6, total: 21.6 },
      },
    });
    renderWithStore(store);
    expect(screen.getByText(/Artículos: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Subtotal: \$20.00/)).toBeInTheDocument();
    expect(screen.getByText(/IVA \(8%\): \$1.60/)).toBeInTheDocument();
    expect(screen.getByText(/Total: \$21.60/)).toBeInTheDocument();
  });

  it('should dispatch removeItem when delete icon is clicked', () => {
    const store = createMockStore({
      posCart: {
        items: [
          { productId: 1, name: 'Remove Me', price: 10, quantity: 1 },
        ],
        totals: { itemCount: 1, subtotal: 10, tax: 0.8, total: 10.8 },
      },
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithStore(store);
    const deleteBtn = screen.getByRole('button', { name: /eliminar remove me/i });
    fireEvent.click(deleteBtn);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'posCart/removeItem' }),
    );
  });

  it('should dispatch checkoutCart and clearCart on checkout', () => {
    const store = createMockStore({
      posCart: {
        items: [
          { productId: 1, name: 'A', price: 10, quantity: 1 },
        ],
        totals: { itemCount: 1, subtotal: 10, tax: 0.8, total: 10.8 },
      },
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithStore(store);
    const btn = screen.getByRole('button', { name: /cobrar/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'posCart/checkoutCart' }),
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'posCart/clearCart' }),
    );
  });
});
