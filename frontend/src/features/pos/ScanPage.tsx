import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Container, Typography, Alert, Box, Chip, IconButton, Button, CircularProgress } from '@mui/material';
import { ArrowBack, CameraAlt, FlashOn, FlashOff } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTenantId } from '@/features/tenant/tenantSlice';
import apiClient from '@/api/client';

type BarcodeFormat =
  | 'aztec' | 'code_128' | 'code_39' | 'code_93' | 'codabar'
  | 'data_matrix' | 'ean_13' | 'ean_8' | 'itf' | 'pdf417'
  | 'qr_code' | 'upc_a' | 'upc_e';

declare global {
  class BarcodeDetector {
    constructor(options?: { formats: BarcodeFormat[] });
    static getSupportedFormats(): Promise<BarcodeFormat[]>;
    detect(image: ImageBitmapSource): Promise<{ rawValue: string }[]>;
  }
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  interface MediaTrackConstraintSet {
    torch?: boolean;
  }
}

const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const storeTenantId = useAppSelector((state) => state.tenant.activeTenantId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [running, setRunning] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'warning' | 'info' | 'error' } | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const cameraRef = useRef<{
    stream: MediaStream | null;
    animFrame: number | null;
    detector: BarcodeDetector | null;
  }>({ stream: null, animFrame: null, detector: null });
  const lastSentRef = useRef<{ barcode: string; time: number } | null>(null);

  // tomar tenant de la URL y setearlo en el store
  useEffect(() => {
    const urlTenant = searchParams.get('tenant');
    if (urlTenant && urlTenant !== storeTenantId) {
      dispatch(setTenantId(urlTenant));
      localStorage.setItem('activeTenantId', urlTenant);
    }
  }, [searchParams, storeTenantId, dispatch]);

  const tenantId = storeTenantId || searchParams.get('tenant');

  const toggleTorch = useCallback(async () => {
    const stream = cameraRef.current.stream;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track?.getCapabilities?.().torch) return;

    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(!torchOn);
    } catch {
      setFeedback({ message: 'No se pudo encender el flash', severity: 'warning' });
    }
  }, [torchOn]);

  const startCamera = useCallback(async () => {
    setFeedback(null);
    const video = videoRef.current;
    if (!video) return;

    if (!tenantId) {
      setFeedback({ message: 'No hay tenant seleccionado', severity: 'error' });
      return;
    }

    const formats = [
      'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code',
    ] as BarcodeFormat[];

    setFeedback({ message: 'Preparando escáner...', severity: 'info' });

    let detector: BarcodeDetector | null = null;
    if ('BarcodeDetector' in window) {
      const supported = await BarcodeDetector.getSupportedFormats();
      const available = formats.filter((f) => supported.includes(f));
      if (available.length > 0) {
        detector = new BarcodeDetector({ formats: available });
      }
    }

    if (!detector) {
      setFeedback({ message: 'Escáner no disponible en este navegador', severity: 'warning' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      video.srcObject = stream;
      await video.play();
      cameraRef.current.stream = stream;
      cameraRef.current.detector = detector;
      setRunning(true);
      setScanning(true);
      setFeedback({ message: 'Escáner activo. Apuntá a un código de barras.', severity: 'info' });

      const track = stream.getVideoTracks()[0];
      setTorchSupported(!!track?.getCapabilities?.().torch);

      const scan = async () => {
        if (!cameraRef.current.stream) return;

        try {
          const barcodes = await detector!.detect(video);
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            const now = Date.now();
            if (lastSentRef.current?.barcode === barcode && now - lastSentRef.current.time < 3000) return;
            lastSentRef.current = { barcode, time: now };
            setFeedback({ message: `Código detectado: ${barcode}. Enviando...`, severity: 'info' });
            try {
              await apiClient.post('/api/scan', { barcode });
              setFeedback({ message: `Enviado: ${barcode}`, severity: 'success' });
              setRecent((prev) => [barcode, ...prev].slice(0, 10));
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Error de conexión';
              setFeedback({ message: `Error al enviar: ${msg}`, severity: 'error' });
            }
          }
        } catch {
          // detection error (none in frame)
        }

        cameraRef.current.animFrame = requestAnimationFrame(scan);
      };
      scan();
    } catch {
      setFeedback({ message: 'Cámara no disponible', severity: 'warning' });
    }
  }, [tenantId]);

  useEffect(() => {
    const cam = cameraRef.current;
    return () => {
      if (cam.animFrame != null) cancelAnimationFrame(cam.animFrame);
      if (cam.stream) {
        const track = cam.stream.getVideoTracks()[0];
        if (track?.getCapabilities?.().torch && track.readyState === 'live') {
          track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
        }
        cam.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <Container sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <IconButton onClick={() => navigate('/pos')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">Escáner Remoto</Typography>
        {scanning && <CircularProgress size={16} sx={{ ml: 'auto' }} />}
      </Box>

      <Box sx={{ position: 'relative', mb: 2 }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: '100%', maxHeight: 300, borderRadius: 8, background: '#000', display: 'block' }}
        />
        {!running && (
          <Box
            sx={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 2, bgcolor: 'rgba(0,0,0,0.5)',
            }}
          >
            <Button variant="contained" size="large" startIcon={<CameraAlt />} onClick={startCamera}>
              Iniciar cámara
            </Button>
          </Box>
        )}
        {running && torchSupported && (
          <IconButton
            onClick={toggleTorch}
            sx={{
              position: 'absolute', top: 8, right: 8,
              bgcolor: 'rgba(0,0,0,0.5)', color: torchOn ? '#ffeb3b' : '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
            size="small"
          >
            {torchOn ? <FlashOn /> : <FlashOff />}
          </IconButton>
        )}
      </Box>

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 2 }}>{feedback.message}</Alert>
      )}

      {recent.length > 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Últimos enviados:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {recent.map((code) => (
              <Chip key={code} label={code} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ScanPage;
