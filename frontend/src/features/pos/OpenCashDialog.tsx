import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, InputAdornment 
} from '@mui/material';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import PlayCircleOutlined from '@mui/icons-material/PlayCircleOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openCashSession } from './cashSlice';
import { useNavigate } from 'react-router-dom';

interface OpenCashDialogProps {
  open: boolean;
}

const OpenCashDialog: React.FC<OpenCashDialogProps> = ({ open }) => {
  const [amount, setAmount] = useState('0');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleOpen = () => {
    if (user) {
      dispatch(openCashSession({ 
        userId: user.userId, 
        initialAmount: parseFloat(amount) || 0 
      }));
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Dialog open={open} disableEscapeKeyDown maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Apertura de Caja Obligatoria
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom color="text.secondary">
            Para realizar ventas, primero debés iniciar un turno cargando el fondo de caja disponible.
          </Typography>
          <TextField
            fullWidth
            label="Monto Inicial (Efectivo)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            sx={{ mt: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWallet color="primary" />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, flexDirection: 'column', gap: 1 }}>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<PlayCircleOutlined />}
          onClick={handleOpen}
          fullWidth
        >
          Abrir Turno y Empezar
        </Button>
        <Button 
          variant="text" 
          color="inherit"
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          fullWidth
        >
          Volver al Inicio (Sin abrir caja)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenCashDialog;
