import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Select, InputLabel, FormControl, Grid, Typography, IconButton, Box,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProduct, updateExistingProduct, fetchCategories } from '../inventorySlice';
import AddCategoryDialog from './AddCategoryDialog';
import type { Product } from '@/api/products';

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const emptyForm = {
  name: '', price: '', barcode: '', brand: '', description: '',
  costPrice: '', stock: '0', minStock: '0', saleUnit: 'unit', categoryId: '' as number | '',
};

const ProductDialog: React.FC<ProductDialogProps> = ({ open, product, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error, categories } = useAppSelector((state) => state.inventory);
  const isEditing = product !== null;

  const [form, setForm] = useState(emptyForm);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchCategories());
      if (product) {
        setForm({
          name: product.name,
          price: product.price.toString(),
          barcode: product.barcode,
          brand: product.brand ?? '',
          description: product.description ?? '',
          costPrice: product.costPrice?.toString() ?? '',
          stock: product.stock.toString(),
          minStock: product.minStock.toString(),
          saleUnit: product.saleUnit,
          categoryId: product.categoryId ?? '',
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, product, dispatch]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async () => {
    if (!form.name || !form.price || !form.barcode) return;

    const data = {
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
    };

    if (isEditing) {
      await dispatch(updateExistingProduct({ id: product!.id, data })).unwrap();
    } else {
      await dispatch(addProduct(data)).unwrap();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Nombre" value={form.name} onChange={handleChange('name')} fullWidth required size="small" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Precio" type="number" value={form.price}
              onChange={handleChange('price')} fullWidth required size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Precio costo" type="number" value={form.costPrice}
              onChange={handleChange('costPrice')} fullWidth size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Código de barras" value={form.barcode} onChange={handleChange('barcode')} fullWidth required size="small" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Marca" value={form.brand} onChange={handleChange('brand')} fullWidth size="small" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Unidad</InputLabel>
              <Select value={form.saleUnit} label="Unidad" onChange={(e) => setForm({ ...form, saleUnit: e.target.value })}>
                <MenuItem value="unit">Unidad</MenuItem>
                <MenuItem value="kg">Kilogramo</MenuItem>
                <MenuItem value="g">Gramo</MenuItem>
                <MenuItem value="l">Litro</MenuItem>
                <MenuItem value="ml">Mililitro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Stock" type="number" value={form.stock}
              onChange={handleChange('stock')} fullWidth size="small" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Stock mín." type="number" value={form.minStock}
              onChange={handleChange('minStock')} fullWidth size="small" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Descripción" value={form.description} onChange={handleChange('description')}
              fullWidth size="small" multiline rows={2} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Categoría</InputLabel>
                <Select value={form.categoryId} label="Categoría" onChange={(e) => setForm({ ...form, categoryId: e.target.value as number })}>
                  <MenuItem value=""><em>Sin categoría</em></MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton size="small" onClick={() => setAddCategoryOpen(true)}>
                <Add />
              </IconButton>
            </Box>
          </Grid>
          <AddCategoryDialog
            open={addCategoryOpen}
            onClose={(createdId) => {
              setAddCategoryOpen(false);
              if (createdId) setForm({ ...form, categoryId: createdId });
            }}
          />
        </Grid>
        {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : isEditing ? 'Guardar' : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
