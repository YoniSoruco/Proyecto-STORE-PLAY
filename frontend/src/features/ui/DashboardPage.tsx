import React, { useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Chip, List, ListItem, 
  ListItemText, Divider, LinearProgress, Stack, Avatar
} from '@mui/material';
import Inventory from '@mui/icons-material/Inventory';
import Warning from '@mui/icons-material/Warning';
import Error from '@mui/icons-material/Error';
import TrendingDown from '@mui/icons-material/TrendingDown';
import EventBusy from '@mui/icons-material/EventBusy';
import History from '@mui/icons-material/History';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInventoryDashboard } from '@/features/inventory/inventorySlice';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dashboard, loading, products } = useAppSelector((state) => state.inventory);
  const { user, activeContext } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchInventoryDashboard());
  }, [dispatch, activeContext?.branchId]);

  if (!dashboard && loading) {
    return (
      <Box sx={{ width: '100%', mt: 5 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Cargando inteligencia de inventario...</Typography>
      </Box>
    );
  }

  if (!dashboard) return null;

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Producto';
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Dashboard de Control
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Hola, <strong>{user?.fullName}</strong>. Esto es lo que requiere tu atención hoy.
          </Typography>
        </Box>
        <Chip 
          icon={<NotificationsActive />} 
          label={`${dashboard.nearExpirationCount + dashboard.lowStockCount + dashboard.expiredCount} Alertas Críticas`} 
          color="error" 
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Estadísticas Rápidas */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Total Productos" 
            value={dashboard.totalProducts} 
            icon={<Inventory color="primary" />} 
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Stock Bajo" 
            value={dashboard.lowStockCount} 
            icon={<TrendingDown color="warning" />} 
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Por Vencer" 
            value={dashboard.nearExpirationCount} 
            icon={<Warning color="info" />} 
            color="#0288d1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard 
            title="Vencidos" 
            value={dashboard.expiredCount} 
            icon={<EventBusy color="error" />} 
            color="#d32f2f"
          />
        </Grid>

        {/* Panel de Vencimientos con Semáforo */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 32, height: 32 }}>
                  <History fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">Semáforo de Vencimientos</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {dashboard.expiringBatches.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Todo bajo control. No hay vencimientos próximos.</Typography>
                </Box>
              ) : (
                <List dense>
                  {dashboard.expiringBatches.map((batch) => {
                    const isExpired = batch.expired;
                    const daysToWait = batch.expirationDate 
                      ? Math.ceil((new Date(batch.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                      : 0;

                    return (
                      <ListItem 
                        key={batch.id}
                        sx={{ 
                          mb: 1, 
                          borderRadius: 1, 
                          bgcolor: isExpired ? 'rgba(211, 47, 47, 0.05)' : 'rgba(237, 108, 2, 0.05)',
                          borderLeft: `4px solid ${isExpired ? '#d32f2f' : '#ed6c02'}`
                        }}
                      >
                        <ListItemText 
                          primary={getProductName(batch.productId)}
                          secondary={
                            <Typography variant="caption" color="textSecondary">
                              Lote: {batch.barcode} • {isExpired ? 'VENCIDO' : `Vence en ${daysToWait} días`}
                            </Typography>
                          }
                        />
                        <Stack alignItems="flex-end">
                          <Chip 
                            label={`${batch.stock} u.`} 
                            size="small" 
                            color={isExpired ? "error" : "warning"}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Stack>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Reposición (Stock Bajo) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 32, height: 32 }}>
                  <ShoppingBag fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">Necesitan Reposición</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {dashboard.lowStockProducts.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Inventario completo. No hay faltantes.</Typography>
                </Box>
              ) : (
                <List dense>
                  {dashboard.lowStockProducts.map((product) => {
                    const percent = (product.totalStock / (product.minStock || 1)) * 100;
                    return (
                      <ListItem key={product.id} sx={{ mb: 1 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
                            <Typography variant="caption" color="error.main" fontWeight="bold">
                              {product.totalStock} / {product.minStock} {product.saleUnit}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(percent, 100)} 
                            color={percent < 50 ? "error" : "warning"}
                            sx={{ height: 6, borderRadius: 5 }}
                          />
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 2, borderTop: `4px solid ${color}`, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
      </Box>
      <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '50%' }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

export default DashboardPage;
