import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Login from '@mui/icons-material/Login';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Usamos axios directo aquí para el login ya que es una ruta pública sin tenant inicial
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        email,
        password
      }, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      dispatch(setCredentials(response.data));
      
      // Redirigir a la selección de contexto
      navigate('/select-context');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              STORE PLAY
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              SaaS Management System
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Login />}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            ¿No tienes cuenta? Contacta con el administrador.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
