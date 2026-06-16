import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Select, InputLabel, FormControl, Grid, Typography, IconButton, Box,
  FormControlLabel, Switch, Divider, Tab, Tabs, Chip, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { Add, Inventory } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProduct, updateExistingProduct, fetchCategories, fetchBatches, addBatchToProduct, fetchSuppliers } from '../inventorySlice';
import AddCategoryDialog from './AddCategoryDialog';
import type { Product, CreateBatchRequest } from '@/api/products';

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const emptyForm = {
  name: '', price: '', cashPrice: '', brand: '', description: '',
  minStock: '0', saleUnit: 'unit', categoryId: '' as number | '',
  requiresExpiration: false,
};

const ProductDialog: React.FC<ProductDialogProps> = ({ open, product, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error, categories, batches, suppliers } = useAppSelector((state) => state.inventory);
  const { user } = useAppSelector((state) => state.auth);
  const isEditing = product !== null;
  const isAdmin = user?.role === 'ADMIN';

  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  
  // Form para nuevo lote
  const [batchForm, setBatchForm] = useState({
    barcode: '', stock: '', costPrice: '', expirationDate: '', supplierId: '' as number | '',
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchCategories());
      dispatch(fetchSuppliers());
      setTab(0);
      if (product) {
        dispatch(fetchBatches(product.id));
        setForm({
          name: product.name,
          price: product.price.toString(),
          cashPrice: product.cashPrice.toString(),
          brand: product.brand ?? '',
          description: product.description ?? '',
          minStock: product.minStock.toString(),
          saleUnit: product.saleUnit,
          categoryId: product.categoryId ?? '',
          requiresExpiration: product.requiresExpiration,
        });
      } else {
        setForm(emptyForm);
      }
      setBatchForm({ barcode: '', stock: '', costPrice: '', expirationDate: '', supplierId: '' });
    }
  }, [open, product, dispatch]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;

    const data = {
      name: form.name,
      price: parseFloat(form.price),
      cashPrice: parseFloat(form.cashPrice) || parseFloat(form.price) * 0.95,
      brand: form.brand || undefined,
      description: form.description || undefined,
      minStock: parseInt(form.minStock) || 0,
      saleUnit: form.saleUnit || 'unit',
      requiresExpiration: form.requiresExpiration,
      categoryId: form.categoryId !== '' ? (form.categoryId as number) : null,
    };

    if (isEditing) {
      await dispatch(updateExistingProduct({ id: product!.id, data })).unwrap();
    } else {
      await dispatch(addProduct(data)).unwrap();
    }
    onClose();
  };

  const handleAddBatch = async () => {
    if (!product || !batchForm.barcode || !batchForm.stock) return;
    
    const data: CreateBatchRequest = {
      barcode: batchForm.barcode,
      stock: parseInt(batchForm.stock),
      costPrice: parseFloat(batchForm.costPrice) || 0,
      expirationDate: batchForm.expirationDate || null,
      supplierId: batchForm.supplierId !== '' ? (batchForm.supplierId as number) : undefined,
    };
    
    await dispatch(addBatchToProduct({ productId: product.id, data })).unwrap();
    setBatchForm({ barcode: '', stock: '', costPrice: '', expirationDate: '', supplierId: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
      
      {isEditing && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="Información" />
          <Tab label="Lotes / Stock" icon={<Inventory fontSize="small" />} iconPosition="start" />
        </Tabs>
      )}

      <DialogContent dividers>
        {tab === 0 ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField label="Nombre" value={form.name} onChange={handleChange('name')} fullWidth required size="small" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Precio Lista" type="number" value={form.price}
                onChange={handleChange('price')} fullWidth required size="small" slotProps={{ htmlInput: { step: '0.01' } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField label="Precio Efectivo" type="number" value={form.cashPrice}
                onChange={handleChange('cashPrice')} fullWidth size="small" helperText="Calculado: -5%" slotProps={{ htmlInput: { step: '0.01' } }} />
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
              <TextField label="Stock mín." type="number" value={form.minStock}
                onChange={handleChange('minStock')} fullWidth size="small" slotProps={{ htmlInput: { min: 0 } }} />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={<Switch checked={form.requiresExpiration} onChange={(e) => setForm({ ...form, requiresExpiration: e.target.checked })} />}
                label="Pide Vencimiento"
              />
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
          </Grid>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Agregar Nuevo Lote</Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Proveedor</InputLabel>
                  <Select
                    value={batchForm.supplierId}
                    label="Proveedor"
                    onChange={(e) => setBatchForm({ ...batchForm, supplierId: e.target.value as number })}
                  >
                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                    {suppliers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 7 }}>
                <TextField label="Código de barras" size="small" fullWidth value={batchForm.barcode} onChange={(e) => setBatchForm({ ...batchForm, barcode: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 5 }}>
                <TextField label="Stock" type="number" size="small" fullWidth value={batchForm.stock} onChange={(e) => setBatchForm({ ...batchForm, stock: e.target.value })} />
              </Grid>
              {isAdmin && (
                <Grid size={{ xs: 6 }}>
                  <TextField label="Costo" type="number" size="small" fullWidth value={batchForm.costPrice} onChange={(e) => setBatchForm({ ...batchForm, costPrice: e.target.value })} />
                </Grid>
              )}
              {form.requiresExpiration && (
                <Grid size={{ xs: isAdmin ? 6 : 12 }}>
                  <TextField label="Vencimiento" type="date" size="small" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={batchForm.expirationDate} onChange={(e) => setBatchForm({ ...batchForm, expirationDate: e.target.value })} />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" fullWidth size="small" startIcon={<Add />} onClick={handleAddBatch}>
                  Cargar Lote
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Lotes Actuales</Typography>
            <TableContainer sx={{ maxHeight: 200 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    {isAdmin && <TableCell align="right">Costo</TableCell>}
                    <TableCell>Vencimiento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(batches[product!.id] || []).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.barcode}</TableCell>
                      <TableCell>{b.supplierName || '—'}</TableCell>
                      <TableCell align="right">{b.stock}</TableCell>
                      {isAdmin && <TableCell align="right">${b.costPrice?.toFixed(2) || '0.00'}</TableCell>}
                      <TableCell>
                        {b.expirationDate ? new Date(b.expirationDate).toLocaleDateString() : '—'}
                        {b.expired && <Chip label="Vencido" size="small" color="error" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(batches[product!.id] || []).length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">Sin lotes cargados</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        <AddCategoryDialog
          open={addCategoryOpen}
          onClose={(createdId) => {
            setAddCategoryOpen(false);
            if (createdId) setForm({ ...form, categoryId: createdId });
          }}
        />
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
