import React, { useEffect, useRef, useState } from 'react';
import { Container, Grid, Typography, Button, Box, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { PhoneAndroid, Close } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processScan } from './posScannerSlice';
import PosProductSearch from './PosProductSearch';
import Cart from './Cart';
import Scanner from './Scanner';

const PosPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTenantId } = useAppSelector((state) => state.tenant);
  const [qrOpen, setQrOpen] = useState(false);
  const firstScanRef = useRef(true);

  useEffect(() => {
    if (!activeTenantId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const es = new EventSource(`${baseUrl}/api/scan/stream?tenant=${activeTenantId}`);

    es.addEventListener('scan', (event) => {
      try {
        const { barcode } = JSON.parse(event.data);
        dispatch(processScan({ barcode, source: 'remote' }));
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

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Punto de Venta
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PhoneAndroid />}
          onClick={() => { (document.activeElement as HTMLElement)?.blur(); setQrOpen(true); }}
        >
          Escanear con celular
        </Button>
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
