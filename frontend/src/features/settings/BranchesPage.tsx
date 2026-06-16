import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, CircularProgress, Tooltip
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Store from '@mui/icons-material/Store';
import LocationOn from '@mui/icons-material/LocationOn';
import apiClient from '@/api/client';

interface Branch {
  id: number;
  name: string;
  address: string;
  active: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Branch[]>('/api/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setName(branch.name);
      setAddress(branch.address);
      setActive(branch.active);
    } else {
      setEditingBranch(null);
      setName('');
      setAddress('');
      setActive(true);
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const payload = { name, address, active };
      if (editingBranch) {
        await apiClient.put(`/api/branches/${editingBranch.id}`, payload);
      } else {
        await apiClient.post('/api/branches', payload);
      }
      setOpenDialog(false);
      loadBranches();
    } catch (error) {
      console.error('Error guardando sucursal:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta sucursal?')) return;
    try {
      await apiClient.delete(`/api/branches/${id}`);
      loadBranches();
    } catch (error) {
      console.error('Error eliminando sucursal:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Gestión de Sucursales</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => handleOpenDialog()}
        >
          Nueva Sucursal
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Sucursal</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Store color={branch.active ? "primary" : "disabled"} />
                      <Typography variant="body1" fontWeight="medium">
                        {branch.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="inherit" color="action" />
                      <Typography variant="body2">{branch.address}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        px: 1, py: 0.5, borderRadius: 1,
                        bgcolor: branch.active ? 'success.light' : 'error.light',
                        color: branch.active ? 'success.dark' : 'error.dark',
                        fontWeight: 'bold'
                      }}
                    >
                      {branch.active ? 'ACTIVA' : 'INACTIVA'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(branch)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => handleDelete(branch.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" sx={{ py: 3 }} color="textSecondary">
                      No hay sucursales registradas.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre de la Sucursal"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sucursal Norte"
            />
            <TextField
              label="Dirección"
              fullWidth
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Siempreviva 123"
            />
            <FormControlLabel
              control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} color="primary" />}
              label="Sucursal Activa"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!name}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
