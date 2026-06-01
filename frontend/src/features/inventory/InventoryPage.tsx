import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import ProductEditDialog from './components/ProductEditDialog';
import { useAppDispatch } from '@/store/hooks';
import { fetchCategories } from './inventorySlice';
import type { Product } from '@/api/products';

const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Gestión de Inventario</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cerrar' : 'Agregar Producto'}
        </Button>
      </Stack>
      <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
        {showAddForm && (
          <Stack sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <ProductForm onSave={() => setShowAddForm(false)} />
          </Stack>
        )}
        <Stack sx={{ flex: '2 1 400px', minWidth: 400 }}>
          <ProductList onEdit={(product) => setEditingProduct(product)} />
        </Stack>
      </Stack>
      <ProductEditDialog
        open={editingProduct !== null}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    </Container>
  );
};

export default InventoryPage;
