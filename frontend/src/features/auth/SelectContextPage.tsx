import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Grid, Card, CardActionArea, 
  CardContent, Avatar, Chip, Fade, useTheme, Stack
} from '@mui/material';
import Business from '@mui/icons-material/Business';
import Storefront from '@mui/icons-material/Storefront';
import CheckCircle from '@mui/icons-material/CheckCircle';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { setContext, type TenantAccess } from '@/features/auth/authSlice';

export default function SelectContextPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSelect = (access: TenantAccess) => {
    dispatch(setContext({
      tenantId: access.tenantId,
      branchId: access.branchId,
      role: access.role
    }));
    navigate('/');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" fontWeight="900" color="primary" gutterBottom sx={{ letterSpacing: '-0.02em' }}>
              STORE<span style={{ color: theme.palette.text.secondary }}>PLAY</span>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400 }}>
              Hola, <span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>{user.fullName}</span>. 
              Seleccioná tu espacio de trabajo.
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {user.availableTenants.map((access, index) => (
            <Grid size={{ xs: 12 }} key={access.tenantId}>
              <Fade in timeout={800 + (index * 200)}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 4, 
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      transform: 'scale(1.01)',
                      borderColor: access.primaryColor || theme.palette.primary.main,
                      boxShadow: `0 10px 40px -10px ${access.primaryColor}44`
                    }
                  }}
                >
                  <CardActionArea onClick={() => handleSelect(access)} sx={{ p: 1 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 } }}>
                      
                      <Avatar sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: access.primaryColor ? `${access.primaryColor}11` : '#1976d211',
                        color: access.primaryColor || 'primary.main',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: access.primaryColor ? `${access.primaryColor}33` : 'divider'
                      }}>
                        {access.verticalType === 'KIOSKO' ? <Storefront fontSize="large" /> : <Business fontSize="large" />}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="h5" fontWeight="800">
                            {access.tenantName}
                          </Typography>
                          {access.role === 'OWNER' && (
                            <Chip label="PROPIETARIO" size="small" color="primary" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900 }} />
                          )}
                        </Stack>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                          Rubro: <strong>{access.verticalType}</strong> • Sucursal: <strong>{access.branchId ? 'Asignada' : 'Todas'}</strong>
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', color: 'text.disabled' }}>
                        <Typography variant="button" sx={{ mr: 1, fontWeight: 700 }}>Entrar</Typography>
                        <KeyboardArrowRight />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>
            Plataforma Multi-Negocio Segura
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
