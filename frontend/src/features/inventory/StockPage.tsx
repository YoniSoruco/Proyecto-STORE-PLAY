import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, CircularProgress, Tooltip, Autocomplete
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Inventory from '@mui/icons-material/Inventory';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Event from '@mui/icons-material/Event';
import QrCode from '@mui/icons-material/QrCode';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllBatches, fetchProducts, fetchSuppliers, addBatchToProduct } from './inventorySlice';

export default function StockPage() {
  const dispatch = useAppDispatch();
  const { allBatches, products, suppliers, loading } = useAppSelector((state) => state.inventory);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Form state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [barcode, setBarcode] = useState('');
  const [stock, setStock] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    dispatch(fetchAllBatches());
    dispatch(fetchProducts());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleAddStock = async () => {
    if (!selectedProduct) return;
    
    try {
      await dispatch(addBatchToProduct({
        productId: selectedProduct.id,
        data: {
          barcode: barcode || `LOTE-${Date.now()}`,
          stock: parseInt(stock),
          costPrice: parseFloat(costPrice),
          supplierId: selectedSupplier ? parseInt(selectedSupplier) : undefined,
          expirationDate: expirationDate ? `${expirationDate}T00:00:00` : null
        }
      })).unwrap();
      
      setOpenDialog(false);
      resetForm();
      dispatch(fetchAllBatches());
    } catch (error) {
      console.error('Error cargando stock:', error);
      alert('Error al cargar el lote. Verifique los datos.');
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedSupplier('');
    setBarcode('');
    setStock('');
    setCostPrice('');
    setExpirationDate('');
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Desconocido';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Control de Stock (Lotes)</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setOpenDialog(true)}
        >
          Ingresar Mercadería
        </Button>
      </Box>

      {loading && allBatches.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Código de Lote</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell align="right">Stock Actual</TableCell>
                <TableCell align="right">Costo</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allBatches.map((batch) => (
                <TableRow key={batch.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {getProductName(batch.productId)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QrCode fontSize="inherit" color="action" />
                      <Typography variant="caption">{batch.barcode}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{batch.supplierName || '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color={batch.stock <= 5 ? "error.main" : "textPrimary"}>
                      {batch.stock}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {batch.costPrice ? `$${batch.costPrice.toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell>
                    {batch.expirationDate ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Event fontSize="inherit" color="action" />
                        <Typography variant="body2">{new Date(batch.expirationDate).toLocaleDateString()}</Typography>
                      </Box>
                    ) : 'No vence'}
                  </TableCell>
                  <TableCell>
                    {batch.expired ? (
                      <Chip label="VENCIDO" size="small" color="error" />
                    ) : batch.stock === 0 ? (
                      <Chip label="AGOTADO" size="small" variant="outlined" />
                    ) : (
                      <Chip label="DISPONIBLE" size="small" color="success" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {allBatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" sx={{ py: 3 }} color="textSecondary">
                      No hay lotes de stock registrados. Use el botón "Ingresar Mercadería".
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogo de Ingreso de Stock */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Ingreso de Mercadería (Nuevo Lote)</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            
            <Autocomplete
              options={products}
              getOptionLabel={(option) => option.name}
              value={selectedProduct}
              onChange={(_, newValue) => setSelectedProduct(newValue)}
              renderInput={(params) => <TextField {...params} label="Seleccionar Producto" fullWidth required />}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Cantidad Ingresada"
                type="number"
                fullWidth
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <TextField
                label="Precio de Costo (Unitario)"
                type="number"
                fullWidth
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> } }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Proveedor</InputLabel>
              <Select
                value={selectedSupplier}
                label="Proveedor"
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                <MenuItem value="">Sin especificar</MenuItem>
                {suppliers.map(s => (
                  <MenuItem key={s.id} value={s.id.toString()}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Código de Lote / Barcode"
                fullWidth
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Escaneé o deje vacío para auto-generar"
              />
              <TextField
                label="Fecha de Vencimiento"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleAddStock}
            disabled={!selectedProduct || !stock || !costPrice}
            startIcon={<Inventory />}
          >
            Confirmar Ingreso
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
