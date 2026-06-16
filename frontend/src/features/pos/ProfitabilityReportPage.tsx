import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, LinearProgress, Card, CardContent,
  CircularProgress, Stack, Divider, Alert
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import AttachMoney from '@mui/icons-material/AttachMoney';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import PieChart from '@mui/icons-material/PieChart';
import BarChart from '@mui/icons-material/BarChart';
import LocalOffer from '@mui/icons-material/LocalOffer';
import apiClient from '@/api/client';

interface ProductProfit {
  productId: number;
  productName: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface ProfitabilityReport {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  averageMargin: number;
  topProducts: ProductProfit[];
}

export default function ProfitabilityReportPage() {
  const [report, setReport] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<ProfitabilityReport>('/api/reports/profitability');
      setReport(response.data);
    } catch (error) {
      console.error('Error cargando reporte de rentabilidad:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!report) return <Alert severity="error">No se pudo cargar el reporte.</Alert>;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Análisis de Rentabilidad</Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Seguimiento en tiempo real de ingresos, costos y ganancia neta.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3} sx={{ borderTop: '4px solid #1976d2' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AttachMoney color="primary" />
                <Typography variant="subtitle2" color="textSecondary">Ingresos Totales</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">${report.totalRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3} sx={{ borderTop: '4px solid #d32f2f' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ShoppingBag color="error" />
                <Typography variant="subtitle2" color="textSecondary">Costo de Mercadería</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">${report.totalCost.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3} sx={{ borderTop: '4px solid #2e7d32', bgcolor: 'rgba(46, 125, 50, 0.04)' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="subtitle2" color="textSecondary">Ganancia Neta</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold" color="success.main">${report.netProfit.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={3} sx={{ borderTop: '4px solid #ed6c02' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PieChart color="warning" />
                <Typography variant="subtitle2" color="textSecondary">Margen Promedio</Typography>
              </Stack>
              <Typography variant="h5" fontWeight="bold">{report.averageMargin.toFixed(2)}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BarChart color="primary" /> Productos más Rentables
      </Typography>
      
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Vendido</TableCell>
              <TableCell align="right">Costo</TableCell>
              <TableCell align="right">Ganancia</TableCell>
              <TableCell>Margen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report.topProducts.map((p) => (
              <TableRow key={p.productId} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOffer fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="bold">{p.productName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">${p.revenue.toFixed(2)}</TableCell>
                <TableCell align="right">${p.cost.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  +${p.profit.toFixed(2)}
                </TableCell>
                <TableCell sx={{ width: '25%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(p.margin, 100)} 
                        color={p.margin > 40 ? "success" : p.margin > 20 ? "primary" : "warning"}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="caption" fontWeight="bold">{p.margin.toFixed(1)}%</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4 }}>
        <Alert severity="info" variant="outlined">
          <strong>Tip de gestión:</strong> Los productos con margen inferior al 20% podrían requerir una revisión de precios o cambio de proveedor.
        </Alert>
      </Box>
    </Box>
  );
}
