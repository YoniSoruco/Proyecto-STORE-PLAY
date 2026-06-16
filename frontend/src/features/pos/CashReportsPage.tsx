import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Stack
} from '@mui/material';
import LockOpen from '@mui/icons-material/LockOpen';
import Lock from '@mui/icons-material/Lock';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';
import CheckCircle from '@mui/icons-material/CheckCircle';
import apiClient from '@/api/client';
import type { CashSession } from './cashSlice';

export default function CashReportsPage() {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<CashSession[]>('/api/cash-sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error cargando sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifference = (session: CashSession) => {
    if (!session.finalAmountReal || !session.finalAmountExpected) return 0;
    return session.finalAmountReal - session.finalAmountExpected;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Reportes de Arqueo</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Estado</TableCell>
                <TableCell>Apertura / Cierre</TableCell>
                <TableCell align="right">Monto Inicial</TableCell>
                <TableCell align="right">Esperado</TableCell>
                <TableCell align="right">Real (Contado)</TableCell>
                <TableCell align="right">Diferencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => {
                const diff = getDifference(session);
                return (
                  <TableRow key={session.id} hover>
                    <TableCell>
                      <Chip 
                        icon={session.open ? <LockOpen /> : <Lock />} 
                        label={session.open ? "ABIERTA" : "CERRADA"} 
                        color={session.open ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {new Date(session.openedAt).toLocaleString()}
                      </Typography>
                      {!session.open && (
                        <Typography variant="caption" color="textSecondary">
                          Cerró: {new Date(session.closedAt!).toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">${session.initialAmount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {session.open ? "—" : `$${session.finalAmountExpected?.toFixed(2)}`}
                    </TableCell>
                    <TableCell align="right">
                      {session.open ? "—" : `$${session.finalAmountReal?.toFixed(2)}`}
                    </TableCell>
                    <TableCell align="right">
                      {session.open ? (
                        "—"
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <Typography 
                            variant="body2" 
                            fontWeight="bold" 
                            color={diff === 0 ? "success.main" : diff > 0 ? "info.main" : "error.main"}
                          >
                            ${diff.toFixed(2)}
                          </Typography>
                          {diff === 0 ? <CheckCircle color="success" fontSize="inherit" /> : 
                           diff > 0 ? <TrendingUp color="info" fontSize="inherit" /> : 
                           <TrendingDown color="error" fontSize="inherit" />}
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" sx={{ py: 3 }} color="textSecondary">
                      No hay registros de arqueo.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
