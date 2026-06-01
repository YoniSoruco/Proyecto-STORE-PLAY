import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Scanner from './Scanner';
import posScannerReducer from './posScannerSlice';

function createMockStore() {
  return configureStore({
    reducer: { posScanner: posScannerReducer },
    preloadedState: { posScanner: { status: 'idle' as const, lastScan: null, feedback: null, error: null } },
  });
}

function renderWithStore(store: ReturnType<typeof createMockStore>) {
  return render(
    <Provider store={store}>
      <Scanner />
    </Provider>,
  );
}

beforeEach(() => {
  vi.stubGlobal('navigator', {
    ...navigator,
    mediaDevices: {
      getUserMedia: vi.fn().mockRejectedValue(
        new DOMException('Camera not available', 'NotFoundError'),
      ),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Scanner', () => {
  it('should render manual input field', async () => {
    const store = createMockStore();
    renderWithStore(store);

    // Wait for the camera request to fail and show fallback
    const input = await screen.findByPlaceholderText('Ingresar código');
    expect(input).toBeInTheDocument();
  });

  it('should show validation error for non-numeric input', async () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = await screen.findByPlaceholderText('Ingresar código');
    const scanBtn = screen.getByRole('button', { name: /escanear/i });

    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.click(scanBtn);

    expect(screen.getByText('El código debe ser numérico.')).toBeInTheDocument();
  });

  it('should show validation error for short barcode', async () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = await screen.findByPlaceholderText('Ingresar código');
    const scanBtn = screen.getByRole('button', { name: /escanear/i });

    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(scanBtn);

    expect(screen.getByText('El código debe tener 8–14 dígitos.')).toBeInTheDocument();
  });

  it('should dispatch scanDetected on valid manual input', async () => {
    const store = createMockStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithStore(store);

    const input = await screen.findByPlaceholderText('Ingresar código');
    const scanBtn = screen.getByRole('button', { name: /escanear/i });

    fireEvent.change(input, { target: { value: '8901234567890' } });
    fireEvent.click(scanBtn);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'posScanner/scanDetected' }),
    );
  });

  it('should clear input after valid manual submission', async () => {
    const store = createMockStore();
    renderWithStore(store);

    const input = await screen.findByPlaceholderText('Ingresar código') as HTMLInputElement;
    const scanBtn = screen.getByRole('button', { name: /escanear/i });

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
        payload: { feedback: { message: 'Agregado: Test Product', severity: 'success' as const } },
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
        payload: { feedback: { message: 'Producto no encontrado', severity: 'warning' as const } },
      });
    });

    expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument();
  });

  it('should show camera permission denied message', async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(
      new DOMException('Permission denied', 'NotAllowedError'),
    );

    const store = createMockStore();
    renderWithStore(store);

    // Wait for the error state to propagate
    expect(await screen.findByText(/Permiso de cámara denegado/)).toBeInTheDocument();
  });
});
