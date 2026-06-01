import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, MenuItem, Select, InputLabel, FormControl, Grid
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProduct, fetchCategories } from '../inventorySlice';

interface ProductFormProps {
  initial?: {
    name: string; price: string; barcode: string; brand: string; description: string;
    costPrice: string; stock: string; minStock: string; saleUnit: string; categoryId: number | '';
  };
  onSave?: () => void;
}

const defaultState = {
  name: '', price: '', barcode: '', brand: '', description: '',
  costPrice: '', stock: '0', minStock: '0', saleUnit: 'unit', categoryId: '' as number | '',
};

const ProductForm: React.FC<ProductFormProps> = ({ initial, onSave }) => {
  const [form, setForm] = useState(initial ?? defaultState);
  const dispatch = useAppDispatch();
  const { loading, error, categories } = useAppSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.barcode) return;

    await dispatch(addProduct({
      name: form.name,
      price: parseFloat(form.price),
      barcode: form.barcode,
      brand: form.brand || undefined,
      description: form.description || undefined,
      costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 0,
      saleUnit: form.saleUnit || 'unit',
      categoryId: form.categoryId !== '' ? (form.categoryId as number) : null,
    })).unwrap();

    setForm(defaultState);
    onSave?.();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Agregar Producto</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Nombre" value={form.name} onChange={handleChange('name')} required size="small" />
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <TextField label="Precio" type="number" value={form.price}
              onChange={handleChange('price')} required size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Precio costo" type="number" value={form.costPrice}
              onChange={handleChange('costPrice')} size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
          </Grid>
        </Grid>
        <TextField label="Código de barras" value={form.barcode} onChange={handleChange('barcode')} required size="small" />
        <TextField label="Marca" value={form.brand} onChange={handleChange('brand')} size="small" />
        <TextField label="Descripción" value={form.description} onChange={handleChange('description')}
          size="small" multiline rows={2} />
        <Grid container spacing={1}>
          <Grid size={{ xs: 4 }}>
            <TextField label="Stock" type="number" value={form.stock}
              onChange={handleChange('stock')} size="small" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField label="Stock mín." type="number" value={form.minStock}
              onChange={handleChange('minStock')} size="small" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Unidad</InputLabel>
              <Select value={form.saleUnit} label="Unidad"
                onChange={(e) => setForm({ ...form, saleUnit: e.target.value })}>
                <MenuItem value="unit">Unidad</MenuItem>
                <MenuItem value="kg">Kilogramo</MenuItem>
                <MenuItem value="g">Gramo</MenuItem>
                <MenuItem value="l">Litro</MenuItem>
                <MenuItem value="ml">Mililitro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <FormControl size="small">
          <InputLabel>Categoría</InputLabel>
          <Select value={form.categoryId} label="Categoría"
            onChange={(e) => setForm({ ...form, categoryId: e.target.value as number })}>
            <MenuItem value=""><em>Sin categoría</em></MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Producto'}
        </Button>
        {error && <Typography color="error" variant="body2">{error}</Typography>}
      </Box>
    </Box>
  );
};

export default ProductForm;
