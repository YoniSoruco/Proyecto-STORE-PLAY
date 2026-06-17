import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/features/auth/LoginPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import SelectContextPage from '@/features/auth/SelectContextPage';
import InventoryPage from '@/features/inventory/InventoryPage';
import StockPage from '@/features/inventory/StockPage';
import SuppliersPage from '@/features/inventory/SuppliersPage';
import PosPage from '@/features/pos/PosPage';
import ScanPage from '@/features/pos/ScanPage';
import DashboardPage from '@/features/ui/DashboardPage';
import UsersPage from '@/features/settings/UsersPage';
import BranchesPage from '@/features/settings/BranchesPage';
import TenantsPage from '@/features/settings/TenantsPage';
import SalesHistoryPage from '@/features/pos/SalesHistoryPage';
import CashReportsPage from '@/features/pos/CashReportsPage';
import ProfitabilityReportPage from '@/features/pos/ProfitabilityReportPage';
import { useAppSelector } from '@/store/hooks';

function App() {
  const { isAuthenticated, activeContext } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/select-context" element={<SelectContextPage />} />
      
      <Route path="/scan" element={
        isAuthenticated && activeContext ? <ScanPage /> : <Navigate to="/login" />
      } />
      
      <Route path="/*" element={
        isAuthenticated ? (
          activeContext ? (
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/stock" element={<StockPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/pos" element={<PosPage />} />
                <Route path="/sales/history" element={<SalesHistoryPage />} />
                <Route path="/reports/cash" element={<CashReportsPage />} />
                <Route path="/reports/sales" element={<ProfitabilityReportPage />} />
                <Route path="/settings/users" element={<UsersPage />} />
                <Route path="/settings/branches" element={<BranchesPage />} />
                <Route path="/settings/tenants" element={<TenantsPage />} />
              </Routes>
            </AppLayout>
          ) : <Navigate to="/select-context" />
        ) : <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default App;
