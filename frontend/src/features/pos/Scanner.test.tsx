import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Scanner from './Scanner';
import posScannerReducer from './posScannerSlice';
import inventoryReducer from '@/features/inventory/inventorySlice';
import tenantReducer from '@/features/tenant/tenantSlice';
import posCartReducer from './posCartSlice';

function createMockStore() {
  return configureStore({
    reducer: {
      posScanner: posScannerReducer,
      posCart: posCartReducer,
      inventory: inventoryReducer,
      tenant: tenantReducer,
    },
    preloadedState: {
      posScanner: { status: 'idle', lastScan: null, feedback: null, error: null },
      posCart: { items: [], totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 }, checkoutLoading: false, checkoutError: null },
      inventory: { products: [], categories: [], loading: false, error: null },
      tenant: { tenants: [], activeTenantId: null, loading: false },
    },
  });
}

function renderWithStore(store: ReturnType<typeof createMockStore>) {
  return render(
    <Provider store={store}>
      <Scanner />
    </Provider>,
  );
}

describe('Scanner', () => {
  it('should render manual input field', () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = screen.getByPlaceholderText('Ingresar código');
    expect(input).toBeInTheDocument();
  });

  it('should show validation error for non-numeric input', () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = screen.getByPlaceholderText('Ingresar código');
    const scanBtn = screen.getByRole('button', { name: /agregar/i });

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(scanBtn);

    expect(screen.getByText('El código debe ser numérico.')).toBeInTheDocument();
  });

  it('should show validation error for short barcode', () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = screen.getByPlaceholderText('Ingresar código');
    const scanBtn = screen.getByRole('button', { name: /agregar/i });

    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(scanBtn);

    expect(screen.getByText('El código debe tener 3–20 dígitos.')).toBeInTheDocument();
  });

  it('should dispatch processScan on valid manual input', () => {
    const store = createMockStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithStore(store);

    const input = screen.getByPlaceholderText('Ingresar código');
    const scanBtn = screen.getByRole('button', { name: /agregar/i });

    fireEvent.change(input, { target: { value: '8901234567890' } });
    fireEvent.click(scanBtn);

    // processScan dispatches a thunk (function), not a plain action
    expect(dispatchSpy).toHaveBeenCalled();
    expect(typeof dispatchSpy.mock.calls[0][0]).toBe('function');
  });

  it('should clear input after valid manual submission', () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = screen.getByPlaceholderText('Ingresar código') as HTMLInputElement;
    const scanBtn = screen.getByRole('button', { name: /agregar/i });

    fireEvent.change(input, { target: { value: '8901234567890' } });
    fireEvent.click(scanBtn);

    expect(input.value).toBe('');
  });

  it('should render success feedback from store state', async () => {
    const store = createMockStore();
    renderWithStore(store);

    await act(async () => {
      store.dispatch({
        type: 'posScanner/processScan/fulfilled',
        payload: { feedback: { message: 'Agregado: Test Product', severity: 'success' } },
      });
    });

    expect(await screen.findByText('Agregado: Test Product')).toBeInTheDocument();
  });

  it('should render warning feedback from store state', async () => {
    const store = createMockStore();
    renderWithStore(store);

    await act(async () => {
      store.dispatch({
        type: 'posScanner/processScan/fulfilled',
        payload: { feedback: { message: 'Producto no encontrado', severity: 'warning' } },
      });
    });

    expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument();
  });
});
