import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Grid, Paper, Divider, 
  Alert 
} from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Calculate from '@mui/icons-material/Calculate';
import Difference from '@mui/icons-material/Difference';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeCashSession } from './cashSlice';

interface CloseCashDialogProps {
  open: boolean;
  onClose: () => void;
}

const CloseCashDialog: React.FC<CloseCashDialogProps> = ({ open, onClose }) => {
  const [realAmount, setRealAmount] = useState('');
  const dispatch = useAppDispatch();
  const { activeSession } = useAppSelector((state) => state.cash);

  // En un caso real, el "expected" se calcularía en el backend, 
  // pero aquí podemos mostrar un estimado si tuviéramos los datos de ventas.
  // Por ahora lo dejamos como una rendición a ciegas (que es más segura).

  const handleClose = async () => {
    if (activeSession) {
      await dispatch(closeCashSession({ 
        sessionId: activeSession.id, 
        realAmount: parseFloat(realAmount) || 0 
      }));
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Cierre de Caja y Arqueo
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Contá todo el efectivo físico que tenés en el cajón y cargá el monto total aquí abajo.
          </Alert>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover' }}>
                <AccountBalanceWallet color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="subtitle2" color="textSecondary">Monto Inicial</Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${activeSession?.initialAmount.toFixed(2) || '0.00'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', border: '2px solid #1976d2' }}>
                <Calculate color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="subtitle2" color="textSecondary">Monto Contado (Real)</Typography>
                <TextField
                  variant="standard"
                  type="number"
                  value={realAmount}
                  onChange={(e) => setRealAmount(e.target.value)}
                  placeholder="0.00"
                  slotProps={{
                    input: {
                      startAdornment: <Typography sx={{ mr: 1, fontWeight: 'bold' }}>$</Typography>,
                      style: { fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }
                    }
                  }}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }}>Información de la Sesión</Divider>
          
          <Box sx={{ px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">Abierto por:</Typography>
              <Typography variant="body2" fontWeight="bold">Cajero Actual</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">Fecha y Hora Apertura:</Typography>
              <Typography variant="body2">
                {activeSession ? new Date(activeSession.openedAt).toLocaleString() : '-'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          variant="contained" 
          color="success"
          size="large" 
          startIcon={<CheckCircleOutlined />}
          onClick={handleClose}
          disabled={!realAmount}
          fullWidth
        >
          Confirmar y Cerrar Turno
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseCashDialog;
