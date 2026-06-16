import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  InputAdornment,
  Button,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/features/inventory/inventorySlice';
import { addItem } from './posCartSlice';

const PosProductSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.inventory);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    price: number;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [search, products]);

  const handleAdd = () => {
    if (!selectedProduct) return;
    dispatch(
      addItem({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity,
      }),
    );
    setSelectedProduct(null);
    setQuantity(1);
    setSearch('');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Buscar Productos
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedProduct(null);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        {loading && (
          <Typography variant="body2" color="text.secondary">
            Cargando productos...
          </Typography>
        )}

        {!loading && search && filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No se encontraron productos.
          </Typography>
        )}

        {filtered.length > 0 && (
          <List dense disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filtered.map((product) => (
              <ListItem key={product.id} disablePadding sx={{ flexDirection: 'column' }}>
                <ListItemButton
                  selected={selectedProduct?.id === product.id}
                  onClick={() => {
                    setSelectedProduct(
                      selectedProduct?.id === product.id ? null : product,
                    );
                    setQuantity(1);
                  }}
                >
                  <ListItemText
                    primary={product.name}
                    secondary={`$${product.price.toFixed(2)} — Stock: ${product.totalStock}`}
                  />
                </ListItemButton>
                {selectedProduct?.id === product.id && (
                  <Box sx={{ display: 'flex', gap: 1, px: 2, pb: 1.5, width: '100%' }}>
                    <TextField
                      size="small"
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(isNaN(val) || val < 1 ? 1 : val);
                      }}
                      slotProps={{ htmlInput: { min: 1, style: { width: 60 } } }}
                    />
                    <Button size="small" variant="contained" onClick={handleAdd}>
                      Agregar
                    </Button>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PosProductSearch;
