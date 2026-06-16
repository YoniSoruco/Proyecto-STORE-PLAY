import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import posScannerReducer from './posScannerSlice';
import inventoryReducer from '../inventory/inventorySlice';
import Scanner from './Scanner';
import { getProductByBarcode } from '@/api/products';
import type { Product } from '@/api/products';

vi.mock('@/api/products', () => ({
  getProductByBarcode: vi.fn(),
}));

const mockProduct: Product = {
  id: 1,
  name: 'Test Cola',
  price: 1500,
  priceWithIva: 1815,
  cashPrice: 1425,
  requiresExpiration: false,
  totalStock: 50,
  brand: null,
  description: null,
  minStock: 10,
  saleUnit: 'unit',
  active: true,
  categoryId: null,
  categoryName: null,
};

const renderWithProviders = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      posScanner: posScannerReducer,
      inventory: inventoryReducer,
      posCart: (state = { items: [], totals: { itemCount: 0, subtotal: 0, tax: 0, total: 0 }, checkoutLoading: false, checkoutError: null }) => state,
      auth: (state = { isAuthenticated: true, user: { username: 'test', role: 'CASHIER', branchId: 1 }, token: null }) => state,
      tenant: (state = { activeTenantId: 'tenant1' }) => state,
    },
    preloadedState: {
      inventory: {
        products: [],
        categories: [],
        suppliers: [],
        batches: {},
        dashboard: null,
        loading: false,
        error: null,
        searchResult: null,
      },
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('Scanner', () => {
  it('renders correctly', () => {
    renderWithProviders(<Scanner />);
    expect(screen.getByPlaceholderText('Escanea código de barras...')).toBeInTheDocument();
  });

  it('processes scan when Enter is pressed', async () => {
    vi.mocked(getProductByBarcode).mockResolvedValueOnce(mockProduct);
    renderWithProviders(<Scanner />);

    const input = screen.getByPlaceholderText('Escanea código de barras...');
    fireEvent.change(input, { target: { value: '123456789' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(getProductByBarcode).toHaveBeenCalledWith('123456789');
      expect(screen.getByText('Agregado: Test Cola')).toBeInTheDocument();
    });
  });

  it('shows error when product is not found', async () => {
    vi.mocked(getProductByBarcode).mockRejectedValueOnce(new Error('Not found'));
    renderWithProviders(<Scanner />);

    const input = screen.getByPlaceholderText('Escanea código de barras...');
    fireEvent.change(input, { target: { value: '999999' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
    });
  });
});
