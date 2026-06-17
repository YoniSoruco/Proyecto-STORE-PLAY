import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography, Table, TableContainer, TableHead, TableBody, TableRow, TableCell,
  Paper, TextField, IconButton, Chip, Box,
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, removeProduct } from '../inventorySlice';
import type { Product } from '@/api/products';

interface ProductListProps {
  onEdit?: (product: Product) => void;
}

const unitLabels: Record<string, string> = {
  unit: 'Unidad', kg: 'Kg', g: 'g', l: 'L', ml: 'ml',
};

const ProductList: React.FC<ProductListProps> = ({ onEdit }) => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.inventory);
  const { activeContext } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState('');

  const isEmployee = activeContext?.role === 'EMPLOYEE';

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q)
        || (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [products, search]);

  const handleDelete = (product: Product) => {
    if (window.confirm(`¿Eliminar "${product.name}"?`)) {
      dispatch(removeProduct(product.id));
    }
  };

  if (loading && products.length === 0) {
    return <Typography>Cargando productos...</Typography>;
  }

  if (error && products.length === 0) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Inventario de Productos</Typography>
      <TextField
        placeholder="Buscar por nombre o marca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }}
        sx={{ mb: 2, width: 300 }}
      />
      {filteredProducts.length === 0 ? (
        <Typography>No hay productos disponibles.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell align="right">Precio Lista</TableCell>
                <TableCell align="right">con IVA</TableCell>
                <TableCell align="right">Efectivo</TableCell>
                <TableCell align="right">Stock Total</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Unidad</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Activo</TableCell>
                {!isEmployee && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand || '—'}</TableCell>
                  <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    ${product.priceWithIva.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ${product.cashPrice.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={product.totalStock}
                      size="small"
                      color={product.totalStock <= product.minStock ? 'warning' : 'default'}
                      variant={product.totalStock <= product.minStock ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{product.categoryName || '—'}</TableCell>
                  <TableCell>{unitLabels[product.saleUnit] || product.saleUnit}</TableCell>
                  <TableCell>
                    <Chip label={product.requiresExpiration ? 'Sí' : 'No'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={product.active ? 'Sí' : 'No'} size="small"
                      color={product.active ? 'success' : 'default'} variant="outlined" />
                  </TableCell>
                  {!isEmployee && (
                    <TableCell>
                      <IconButton size="small" onClick={() => onEdit?.(product)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(product)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductList;
