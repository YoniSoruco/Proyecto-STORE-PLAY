import { configureStore } from '@reduxjs/toolkit';
import tenantReducer from '@/features/tenant/tenantSlice';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import inventoryReducer from '@/features/inventory/inventorySlice';
import posCartReducer from '@/features/pos/posCartSlice';
import posScannerReducer from '@/features/pos/posScannerSlice';

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
    auth: authReducer,
    ui: uiReducer,
    inventory: inventoryReducer,
    posCart: posCartReducer,
    posScanner: posScannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
