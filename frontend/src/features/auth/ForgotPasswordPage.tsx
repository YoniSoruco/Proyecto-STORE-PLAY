import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, InputAdornment, IconButton, CircularProgress, Alert } from '@mui/material';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugToken, setDebugToken] = useState('');
  
  const navigate = useNavigate();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message);
      if (response.data.debugToken) {
        setDebugToken(response.data.debugToken);
        setToken(response.data.debugToken); // Auto-completar para facilidad del usuario por ahora
      }
      setStep(2);
    } catch (err: any) {
      setError('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });
      setStep(3); // Éxito final
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          
          {step === 1 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Recuperar Contraseña
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Ingresa tu email para recibir instrucciones
                </Typography>
              </Box>

              <form onSubmit={handleRequestToken}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 3, fontWeight: 'bold' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Instrucciones'}
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Nueva Contraseña
                </Typography>
                <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                  {message}
                </Alert>
                {debugToken && (
                  <Alert severity="warning" sx={{ mt: 1, textAlign: 'left' }}>
                    <strong>Modo Debug:</strong> El código es: <code>{debugToken}</code>
                  </Alert>
                )}
              </Box>

              <form onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  label="Código de recuperación"
                  variant="outlined"
                  margin="normal"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  sx={{ mt: 3, fontWeight: 'bold' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Cambiar Contraseña'}
                </Button>
              </form>
            </>
          )}

          {step === 3 && (
            <Box sx={{ py: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                ¡Todo listo!
              </Typography>
              <Typography color="textSecondary" paragraph>
                Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Volver al Login
              </Button>
            </Box>
          )}

          {step !== 3 && (
            <Button
              startIcon={<ArrowBack />}
              onClick={() => step === 1 ? navigate('/login') : setStep(1)}
              sx={{ mt: 3 }}
              color="inherit"
            >
              Volver
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
