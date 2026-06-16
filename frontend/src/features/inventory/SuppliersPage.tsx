import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Table, TableContainer, TableHead, TableBody, 
  TableRow, TableCell, Paper, IconButton, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, Grid
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSuppliers, addSupplierToStore, removeSupplier } from '@/features/inventory/inventorySlice';
import type { CreateSupplierRequest } from '@/api/suppliers';

const SuppliersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { suppliers, loading } = useAppSelector((state) => state.inventory);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateSupplierRequest>({ name: '', address: '', phoneNumber: '', active: true });

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleSave = async () => {
    if (!form.name) return;
    await dispatch(addSupplierToStore(form)).unwrap();
    setOpen(false);
    setForm({ name: '', address: '', phoneNumber: '', active: true });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este proveedor?')) {
      dispatch(removeSupplier(id));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Proveedores</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Nuevo Proveedor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Celular / Teléfono</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{s.name}</TableCell>
                <TableCell>{s.address || '—'}</TableCell>
                <TableCell>{s.phoneNumber || '—'}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDelete(s.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">No hay proveedores registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar Proveedor</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Nombre / Razón Social" 
                fullWidth 
                required 
                size="small"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Dirección" 
                fullWidth 
                size="small"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField 
                label="Nro de Celular" 
                fullWidth 
                size="small"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuppliersPage;
