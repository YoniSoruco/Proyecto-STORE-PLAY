import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import InventoryPage from '@/features/inventory/InventoryPage';
import PosPage from '@/features/pos/PosPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Bienvenido a Proyecto Store</h2>
            <p className="text-gray-600">
              Plataforma multi-tenant lista para usar.
            </p>
          </div>
        } />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/pos" element={<PosPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
