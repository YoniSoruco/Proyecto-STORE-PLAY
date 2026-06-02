import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TenantState {
  activeTenantId: string | null;
}

const getInitialTenantId = (): string | null => {
  return localStorage.getItem('activeTenantId') || 'tenant1';
};

const initialState: TenantState = {
  activeTenantId: getInitialTenantId(),
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenantId: (state, action: PayloadAction<string | null>) => {
      state.activeTenantId = action.payload;
    },
  },
});

export const { setTenantId } = tenantSlice.actions;
export default tenantSlice.reducer;
