import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'SUPERADMIN' | 'OWNER' | 'ADMIN' | 'EMPLOYEE';

export interface TenantAccess {
  tenantId: string;
  tenantName: string;
  verticalType: string;
  primaryColor?: string;
  role: UserRole;
  branchIds: number[] | null;
  features: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  isSystemAdmin: boolean;
  user: {
    userId: number;
    email: string;
    fullName: string;
    availableTenants: TenantAccess[];
  } | null;
  activeContext: {
    tenantId: string;
    branchId: number | null;
    role: UserRole;
  } | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isSystemAdmin: false,
  user: null,
  activeContext: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ 
      userId: number; 
      email: string; 
      fullName: string; 
      isSystemAdmin: boolean;
      availableTenants: TenantAccess[];
      token: string;
    }>) => {
      state.user = {
        userId: action.payload.userId,
        email: action.payload.email,
        fullName: action.payload.fullName,
        availableTenants: action.payload.availableTenants,
      };
      state.isSystemAdmin = action.payload.isSystemAdmin;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Persistir token en localStorage para que no se pierda al recargar
      localStorage.setItem('token', action.payload.token);
      
      // Si solo tiene un negocio, lo auto-seleccionamos
      if (action.payload.availableTenants.length === 1) {
        const t = action.payload.availableTenants[0];
        state.activeContext = {
          tenantId: t.tenantId,
          branchId: (t.branchIds && t.branchIds.length > 0) ? t.branchIds[0] : null,
          role: t.role,
        };
      }
    },
    setContext: (state, action: PayloadAction<{ tenantId: string; branchId: number | null; role: UserRole }>) => {
      state.activeContext = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.activeContext = null;
      state.isSystemAdmin = false;
      localStorage.removeItem('token');
      localStorage.removeItem('activeTenantId');
    },
  },
});

export const { setCredentials, setContext, logout } = authSlice.actions;
export default authSlice.reducer;
