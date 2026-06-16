import axios from 'axios';
import type { RootState } from '@/store';

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState() as RootState;
      const { user, activeContext, isAuthenticated, token } = state.auth;
      
      if (activeContext?.tenantId) {
        config.headers['X-Tenant-ID'] = activeContext.tenantId;
      }
      
      if (isAuthenticated && token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      if (isAuthenticated && user && activeContext) {
        config.headers['X-User-Id'] = user.userId.toString();
        config.headers['X-User-Role'] = activeContext.role;
        config.headers['X-Branch-Id'] = (activeContext.branchId || 1).toString();
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
