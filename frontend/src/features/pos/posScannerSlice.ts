import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getProductByBarcode } from '@/api/products';
import { addItem } from './posCartSlice';
import type { RootState } from '@/store';

export type ScannerStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable';

export interface ScanResult {
  barcode: string;
  source: 'camera' | 'manual' | 'remote';
  scannedAt: number;
}

export interface ScanFeedback {
  message: string;
  severity: 'success' | 'warning';
}

export interface PosScannerState {
  status: ScannerStatus;
  lastScan: ScanResult | null;
  feedback: ScanFeedback | null;
  error: string | null;
}

const initialState: PosScannerState = {
  status: 'idle',
  lastScan: null,
  feedback: null,
  error: null,
};

export const processScan = createAsyncThunk<
  { feedback: ScanFeedback; skipped?: boolean },
  { barcode: string; source: ScanResult['source'] }
>('posScanner/processScan', async ({ barcode }, { getState, dispatch }) => {
  const state = getState() as RootState;
  const lastScan = state.posScanner.lastScan;
  const isDuplicate =
    lastScan !== null &&
    lastScan.barcode === barcode &&
    Date.now() - lastScan.scannedAt < 2000;

  if (isDuplicate) {
    return { feedback: { message: '', severity: 'success' }, skipped: true };
  }

  const product = state.inventory.products.find((p) => p.barcode === barcode);
  if (product) {
    dispatch(addItem({ productId: product.id, name: product.name, price: product.price }));
    return { feedback: { message: `Agregado: ${product.name}`, severity: 'success' } };
  }

  try {
    const product = await getProductByBarcode(barcode);
    dispatch(addItem({ productId: product.id, name: product.name, price: product.price }));
    return { feedback: { message: `Agregado: ${product.name}`, severity: 'success' } };
  } catch {
    return { feedback: { message: 'Producto no encontrado', severity: 'warning' } };
  }
});

const posScannerSlice = createSlice({
  name: 'posScanner',
  initialState,
  reducers: {
    setScannerStatus(state, action: PayloadAction<ScannerStatus>) {
      state.status = action.payload;
      if (action.payload === 'active') {
        state.error = null;
      }
    },
    scanDetected(state, action: PayloadAction<ScanResult>) {
      const scan = action.payload;
      const isDuplicate =
        state.lastScan !== null &&
        state.lastScan.barcode === scan.barcode &&
        scan.scannedAt - state.lastScan.scannedAt < 2000;

      if (!isDuplicate) {
        state.lastScan = scan;
        state.error = null;
      }
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearFeedback(state) {
      state.feedback = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processScan.fulfilled, (state, action) => {
        if (!action.payload.skipped) {
          state.feedback = action.payload.feedback;
        }
      })
      .addCase(processScan.rejected, (state, action) => {
        state.feedback = { message: action.error.message ?? 'Error al escanear', severity: 'warning' };
      });
  },
});

export const { setScannerStatus, scanDetected, setError, clearError, clearFeedback } = posScannerSlice.actions;
export default posScannerSlice.reducer;
