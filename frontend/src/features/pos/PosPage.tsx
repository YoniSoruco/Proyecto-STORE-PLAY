import React, { useEffect, useRef, useState } from 'react';
import { Container, Grid, Typography, Button, Box, Dialog, DialogTitle, DialogContent, IconButton, Chip } from '@mui/material';
import { PhoneAndroid, Close, LockClock } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processScan } from './posScannerSlice';
import { checkActiveSession } from './cashSlice';
import PosProductSearch from './PosProductSearch';
import Cart from './Cart';
import Scanner from './Scanner';
import OpenCashDialog from './OpenCashDialog';
import CloseCashDialog from './CloseCashDialog';

const PosPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTenantId } = useAppSelector((state) => state.tenant);
  const { user } = useAppSelector((state) => state.auth);
  const { activeSession, loading } = useAppSelector((state) => state.cash);
  
  const [qrOpen, setQrOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const firstScanRef = useRef(true);

  useEffect(() => {
    if (user) {
      dispatch(checkActiveSession(user.userId));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!activeTenantId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const es = new EventSource(`${baseUrl}/api/scan/stream?tenant=${activeTenantId}`);

    es.addEventListener('scan', (event) => {
      try {
        const { barcode } = JSON.parse(event.data);
        dispatch(processScan(barcode));
        if (firstScanRef.current) {
          firstScanRef.current = false;
          setQrOpen(false);
        }
      } catch {
        // ignore malformed events
      }
    });

    return () => es.close();
  }, [activeTenantId, dispatch]);

  const scanUrl = activeTenantId
    ? `${import.meta.env.VITE_NGROK_URL || window.location.origin}/scan?tenant=${activeTenantId}`
    : '';

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>Cargando caja...</Box>;

  return (
    <Container sx={{ py: 4 }}>
      <OpenCashDialog open={!activeSession} />
      <CloseCashDialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Punto de Venta
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeSession && (
            <>
              <Chip 
                icon={<LockClock />} 
                label={`Turno abierto: ${new Date(activeSession.openedAt).toLocaleTimeString()}`}
                color="success" 
                variant="outlined"
              />
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={() => setCloseDialogOpen(true)}
              >
                Cerrar Caja
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhoneAndroid />}
            onClick={() => { (document.activeElement as HTMLElement)?.blur(); setQrOpen(true); }}
          >
            Escanear con celular
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PosProductSearch />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Scanner />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Cart />
        </Grid>
      </Grid>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Escanear con celular
          <IconButton size="small" onClick={() => setQrOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          {activeTenantId ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Escaneá este código QR con la cámara de tu celular
              </Typography>
              <Box sx={{ display: 'inline-block', p: 1, bgcolor: '#fff', borderRadius: 2 }}>
                <QRCodeSVG value={scanUrl} size={200} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, wordBreak: 'break-all' }}>
                {scanUrl}
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary">Seleccioná un tenant primero</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PosPage;
