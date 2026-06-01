import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeModeProvider } from '@/theme/ThemeContext';
import { store } from './store';
import { injectStore } from './api/client';
import './index.css';
import App from './App.tsx';

// Inject store into axios client
injectStore(store);

// Sync tenantId to localStorage
let currentTenantId = store.getState().tenant.activeTenantId;
store.subscribe(() => {
  const previousTenantId = currentTenantId;
  currentTenantId = store.getState().tenant.activeTenantId;
  if (previousTenantId !== currentTenantId) {
    if (currentTenantId) {
      localStorage.setItem('activeTenantId', currentTenantId);
    } else {
      localStorage.removeItem('activeTenantId');
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeModeProvider>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeModeProvider>
    </Provider>
  </StrictMode>,
);
