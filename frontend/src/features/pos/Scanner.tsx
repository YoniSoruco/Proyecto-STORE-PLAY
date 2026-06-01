import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Alert, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setScannerStatus,
  scanDetected,
  setError,
  clearError,
  processScan,
  clearFeedback,
} from './posScannerSlice';

const Scanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, feedback, error } = useAppSelector((state) => state.posScanner);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState('');

  // Auto-focus input for physical scanner
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-focus after scan completes
  useEffect(() => {
    if (feedback) {
      inputRef.current?.focus();
      const timer = setTimeout(() => {
        dispatch(clearFeedback());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback, dispatch]);

  // Request camera on mount
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      dispatch(setScannerStatus('requesting'));
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        dispatch(setScannerStatus('active'));

        // Attempt BarcodeDetector
        if ('BarcodeDetector' in window) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a'] });
          const detectLoop = () => {
            if (!videoRef.current || streamRef.current === null) return;
            detector.detect(videoRef.current).then((barcodes: { rawValue: string }[]) => {
              if (barcodes.length > 0) {
                const barcode = barcodes[0].rawValue;
                const scannedAt = Date.now();
                dispatch(scanDetected({ barcode, source: 'camera', scannedAt }));
                dispatch(processScan({ barcode, source: 'camera' }));
              }
            }).catch(() => {
              // BarcodeDetector might fail silently
            });
            requestAnimationFrame(detectLoop);
          };
          detectLoop();
        }
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          dispatch(setScannerStatus('denied'));
          dispatch(setError('Permiso de cámara denegado. Usá el ingreso manual.'));
        } else {
          dispatch(setScannerStatus('unavailable'));
          dispatch(setError('Cámara no disponible. Usá el ingreso manual.'));
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [dispatch]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setManualError('');

    const trimmed = manualInput.trim();

    // Must be numeric, 8–14 characters
    if (!/^\d+$/.test(trimmed)) {
      setManualError('El código debe ser numérico.');
      return;
    }
    if (trimmed.length < 8 || trimmed.length > 14) {
      setManualError('El código debe tener 8–14 dígitos.');
      return;
    }

    const scannedAt = Date.now();
    dispatch(scanDetected({ barcode: trimmed, source: 'manual', scannedAt }));
    dispatch(processScan({ barcode: trimmed, source: 'manual' }));
    setManualInput('');
  };

  const showManualFallback = status === 'denied' || status === 'unavailable' || status === 'idle';

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Escáner de Código de Barras
        </Typography>

        {status === 'requesting' && (
          <Typography variant="body2" color="text.secondary">
            Solicitando acceso a la cámara...
          </Typography>
        )}

        {status === 'active' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxHeight: 240, borderRadius: 4, background: '#000' }}
          />
        )}

        {feedback && (
          <Alert severity={feedback.severity === 'success' ? 'success' : 'warning'} sx={{ mt: 1, mb: 1 }}>
            {feedback.message}
          </Alert>
        )}

        {error && (
          <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
            {error}
          </Alert>
        )}

        {(showManualFallback || status === 'active') && (
          <Box
            component="form"
            onSubmit={handleManualSubmit}
            sx={{ mt: status === 'active' ? 2 : 0, display: 'flex', gap: 1 }}
          >
            <TextField
              size="small"
              placeholder="Ingresar código"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              error={!!manualError}
              helperText={manualError}
              inputRef={inputRef}
              sx={{ flex: 1 }}
            />
            <Button type="submit" variant="contained" size="small">
              Escanear
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Scanner;
