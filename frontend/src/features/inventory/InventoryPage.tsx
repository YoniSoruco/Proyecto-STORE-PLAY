import React, { useState, useEffect } from 'react';
import { Container, Stack, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import ProductList from './components/ProductList';
import ProductDialog from './components/ProductDialog';
import { useAppDispatch } from '@/store/hooks';
import { fetchCategories } from './inventorySlice';
import type { Product } from '@/api/products';

const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setDialogProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setDialogProduct(product);
    setDialogOpen(true);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Gestión de Inventario</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Agregar Producto
        </Button>
      </Stack>
      <ProductList onEdit={handleOpenEdit} />
      <ProductDialog
        open={dialogOpen}
        product={dialogProduct}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
};

export default InventoryPage;
