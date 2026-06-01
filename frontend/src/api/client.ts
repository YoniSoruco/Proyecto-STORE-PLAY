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
      const tenantId = state.tenant.activeTenantId;
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
