import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/client';

export interface CashSession {
  id: number;
  userId: number;
  branchId: number;
  openedAt: string;
  initialAmount: number;
  finalAmountExpected?: number;
  finalAmountReal?: number;
  open: boolean;
}

interface CashState {
  activeSession: CashSession | null;
  loading: boolean;
  error: string | null;
}

const initialState: CashState = {
  activeSession: null,
  loading: false,
  error: null,
};

export const checkActiveSession = createAsyncThunk(
  'cash/checkActive',
  async (userId: number) => {
    const response = await apiClient.get<CashSession>(`/api/cash-sessions/active/${userId}`);
    return response.data;
  }
);

export const openCashSession = createAsyncThunk(
  'cash/open',
  async ({ userId, initialAmount }: { userId: number; initialAmount: number }) => {
    const response = await apiClient.post<CashSession>('/api/cash-sessions/open', { userId, initialAmount });
    return response.data;
  }
);

export const closeCashSession = createAsyncThunk(
  'cash/close',
  async ({ sessionId, realAmount }: { sessionId: number; realAmount: number }) => {
    const response = await apiClient.post<CashSession>('/api/cash-sessions/close', { sessionId, realAmount });
    return response.data;
  }
);

const cashSlice = createSlice({
  name: 'cash',
  initialState,
  reducers: {
    clearCashError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkActiveSession.pending, (state) => { state.loading = true; })
      .addCase(checkActiveSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload || null;
      })
      .addCase(openCashSession.fulfilled, (state, action) => {
        state.activeSession = action.payload;
      })
      .addCase(closeCashSession.fulfilled, (state) => {
        state.activeSession = null;
      });
  },
});

export const { clearCashError } = cashSlice.actions;
export default cashSlice.reducer;
