import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getProductByBarcode } from '@/api/products';
import { addItem } from './posCartSlice';

export type ScannerStatus = 'idle' | 'scanning' | 'error';

export interface PosScannerState {
  status: ScannerStatus;
  lastScan: string | null;
  error: string | null;
  feedback: string | null;
}

const initialState: PosScannerState = {
  status: 'idle',
  lastScan: null,
  error: null,
  feedback: null,
};

export const processScan = createAsyncThunk(
  'posScanner/processScan',
  async (barcode: string, { dispatch, rejectWithValue }) => {
    try {
      // Tratar de buscar en los productos cargados primero
      // Ahora el barcode está en los lotes, por lo que es mejor delegar la búsqueda
      // siempre a la API para asegurar que se encuentra el producto por el código del lote.
      
      const product = await getProductByBarcode(barcode);
      
      dispatch(
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
        }),
      );

      return { barcode, product };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error 
                  || (err as Error).message 
                  || 'Producto no encontrado';
      return rejectWithValue(msg);
    }
  },
);

const posScannerSlice = createSlice({
  name: 'posScanner',
  initialState,
  reducers: {
    clearLastScan(state) {
      state.lastScan = null;
      state.feedback = null;
    },
    clearError(state) {
      state.error = null;
    },
    setStatus(state, action: PayloadAction<ScannerStatus>) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processScan.pending, (state) => {
        state.status = 'scanning';
        state.error = null;
        state.feedback = null;
      })
      .addCase(processScan.fulfilled, (state, action) => {
        state.status = 'idle';
        state.lastScan = action.payload.barcode;
        state.feedback = `Agregado: ${action.payload.product.name}`;
      })
      .addCase(processScan.rejected, (state, action) => {
        state.status = 'idle';
        state.lastScan = action.meta.arg;
        state.error = (action.payload as string) || 'Error de escaneo';
      });
  },
});

export const { clearLastScan, clearError, setStatus } = posScannerSlice.actions;
export default posScannerSlice.reducer;
