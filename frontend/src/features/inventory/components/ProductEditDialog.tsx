import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Select, InputLabel, FormControl, Grid,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateExistingProduct, fetchCategories } from '../inventorySlice';
import type { Product } from '@/api/products';

interface ProductEditDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const ProductEditDialog: React.FC<ProductEditDialogProps> = ({ open, product, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, categories } = useAppSelector((state) => state.inventory);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [saleUnit, setSaleUnit] = useState('unit');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  useEffect(() => {
    if (open) dispatch(fetchCategories());
  }, [open, dispatch]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setBarcode(product.barcode);
      setBrand(product.brand ?? '');
      setDescription(product.description ?? '');
      setCostPrice(product.costPrice?.toString() ?? '');
      setStock(product.stock.toString());
      setMinStock(product.minStock.toString());
      setSaleUnit(product.saleUnit);
      setCategoryId(product.categoryId ?? '');
    }
  }, [product]);

  const handleSave = async () => {
    if (!product || !name || !price || !barcode) return;
    await dispatch(updateExistingProduct({
      id: product.id,
      data: {
        name, price: parseFloat(price), barcode,
        brand: brand || undefined,
        description: description || undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 0,
        saleUnit: saleUnit || 'unit',
        categoryId: categoryId !== '' ? (categoryId as number) : null,
      },
    })).unwrap();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Producto</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth required size="small" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Precio" type="number" value={price}
              onChange={(e) => setPrice(e.target.value)} fullWidth required size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Precio costo" type="number" value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)} fullWidth size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Código de barras" value={barcode} onChange={(e) => setBarcode(e.target.value)} fullWidth required size="small" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} fullWidth size="small" />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Unidad</InputLabel>
              <Select value={saleUnit} label="Unidad" onChange={(e) => setSaleUnit(e.target.value)}>
                <MenuItem value="unit">Unidad</MenuItem>
                <MenuItem value="kg">Kilogramo</MenuItem>
                <MenuItem value="g">Gramo</MenuItem>
                <MenuItem value="l">Litro</MenuItem>
                <MenuItem value="ml">Mililitro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Stock" type="number" value={stock}
              onChange={(e) => setStock(e.target.value)} fullWidth size="small" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField label="Stock mín." type="number" value={minStock}
              onChange={(e) => setMinStock(e.target.value)} fullWidth size="small" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)}
              fullWidth size="small" multiline rows={2} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select value={categoryId} label="Categoría" onChange={(e) => setCategoryId(e.target.value as number)}>
                <MenuItem value=""><em>Sin categoría</em></MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditDialog;
