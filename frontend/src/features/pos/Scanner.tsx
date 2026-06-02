import React, { useRef, useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Alert, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { processScan } from './posScannerSlice';

const Scanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { feedback } = useAppSelector((state) => state.posScanner);
  const inputRef = useRef<HTMLInputElement>(null);
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState('');

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = () => {
    const trimmed = manualInput.trim();

    if (!/^\d+$/.test(trimmed)) {
      setManualError('El código debe ser numérico.');
      return;
    }
    if (trimmed.length < 3 || trimmed.length > 20) {
      setManualError('El código debe tener 3–20 dígitos.');
      return;
    }

    dispatch(processScan({ barcode: trimmed, source: 'manual' }));
    setManualInput('');
    setManualError('');
    inputRef.current?.focus();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ingresar Código
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Ingresar código"
            value={manualInput}
            onChange={(e) => {
              setManualInput(e.target.value);
              setManualError('');
            }}
            error={!!manualError}
            helperText={manualError}
            inputRef={inputRef}
            sx={{ flex: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleScan(); }}
          />
          <Button variant="contained" size="small" onClick={handleScan}>
            Agregar
          </Button>
        </Box>

        {feedback && (
          <Alert severity={feedback.severity} sx={{ mt: 1 }}>{feedback.message}</Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default Scanner;
