import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, CircularProgress, 
  FormGroup, Checkbox, Grid, Chip, Divider, Avatar, Stack
} from '@mui/material';
import Business from '@mui/icons-material/Business';
import Settings from '@mui/icons-material/Settings';
import Palette from '@mui/icons-material/Palette';
import apiClient from '@/api/client';

interface Tenant {
  id: string;
  name: string;
  verticalType: string;
  primaryColor: string;
  features: string[];
  active: boolean;
}

const AVAILABLE_FEATURES = [
  { id: 'POS', label: 'Punto de Venta', description: 'Habilita ventas y cobros' },
  { id: 'INVENTORY', label: 'Inventario Pro', description: 'Control de lotes y proveedores' },
  { id: 'REPORTS', label: 'Reportes de Rentabilidad', description: 'Análisis de ganancias' },
  { id: 'ALERTS', label: 'Alertas de Vencimiento', description: 'Semáforo preventivo' },
  { id: 'BRANCHES', label: 'Multi-Sucursal', description: 'Gestión de múltiples locales' },
];

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1976d2');
  const [features, setFeatures] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Tenant[]>('/api/admin/tenants');
      setTenants(response.data);
    } catch (error: any) {
      console.error('Error cargando negocios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setName(tenant.name);
    setPrimaryColor(tenant.primaryColor || '#1976d2');
    setFeatures(tenant.features || []);
    setActive(tenant.active);
    setOpenDialog(true);
  };

  const handleToggleFeature = (featureId: string) => {
    setFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId) 
        : [...prev, featureId]
    );
  };

  const handleSave = async () => {
    if (!selectedTenant) return;
    try {
      await apiClient.put(`/api/admin/tenants/${selectedTenant.id}`, {
        name,
        verticalType: selectedTenant.verticalType,
        primaryColor,
        features,
        active
      });
      setOpenDialog(false);
      loadTenants();
    } catch (error) {
      console.error('Error guardando negocio:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Gestión de Negocios (SaaS)</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Panel exclusivo del SuperAdmin para habilitar módulos y controlar suscripciones.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Negocio</TableCell>
                <TableCell>Módulos Activos</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: t.primaryColor, width: 40, height: 40 }}>
                        <Business />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">{t.name}</Typography>
                        <Typography variant="caption" color="textSecondary">ID: {t.id} | {t.verticalType}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {t.features?.map(f => (
                        <Chip key={f} label={f} size="small" variant="outlined" color="primary" />
                      )) || <Typography variant="caption">Sin módulos</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t.active ? 'SUSCRIPCIÓN ACTIVA' : 'BLOQUEADO'} 
                      color={t.active ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      startIcon={<Settings />} 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleEdit(t)}
                    >
                      Configurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogo de Configuración de Negocio */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Configurar Negocio: {selectedTenant?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            {/* Removí prop 'item' de Grid para React 19 / MUI v6 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Datos del Negocio</Typography>
              <TextField
                label="Nombre Comercial"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mt: 1, mb: 3 }}
              />
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette fontSize="small" /> Color de Identidad
              </Typography>
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: '100%', height: '40px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <FormControlLabel
                control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
                label="Negocio habilitado (Suscripción al día)"
                sx={{ mt: 3 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Módulos Habilitados</Typography>
              <FormGroup>
                {AVAILABLE_FEATURES.map((feature) => (
                  <Paper key={feature.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={features.includes(feature.id)} 
                          onChange={() => handleToggleFeature(feature.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{feature.label}</Typography>
                          <Typography variant="caption" color="textSecondary">{feature.description}</Typography>
                        </Box>
                      }
                    />
                  </Paper>
                ))}
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
          <Button variant="contained" onClick={handleSave} size="large">
            Aplicar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
