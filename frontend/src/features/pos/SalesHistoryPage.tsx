import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  CircularProgress, Chip, Tooltip 
} from '@mui/material';
import Print from '@mui/icons-material/Print';
import Visibility from '@mui/icons-material/Visibility';
import { fetchSales, type SaleResponse } from '@/api/sales';
import { useAppSelector } from '@/store/hooks';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, activeContext } = useAppSelector((state) => state.auth);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await fetchSales();
      setSales(data);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (sale: SaleResponse) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = sale.items.map(i => `
      <tr>
        <td style="text-align:left">${i.productName} x${i.quantity}</td>
        <td style="text-align:right">$${(i.unitPrice * i.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const paymentsHtml = sale.payments.map(p => `
      <div style="display:flex; justify-content:space-between">
        <span>${p.method}:</span>
        <span>$${p.amount.toFixed(2)}</span>
      </div>
    `).join('');

    const activeTenant = user?.availableTenants.find(t => t.tenantId === activeContext?.tenantId);

    printWindow.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 280px; padding: 5px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-size: 14px; font-weight: bold; margin-top: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0">${activeTenant?.tenantName || 'STORE PLAY'}</h2>
            <p style="margin:0">${sale.invoiceType === 'TICKET_NO_FISCAL' ? 'NO VALIDO COMO FACTURA' : `FACTURA ${sale.invoiceType}`}</p>
            <p style="margin:0">Nro: ${sale.invoiceNumber || '—'}</p>
            <p style="margin:0">Fecha: ${new Date(sale.createdAt).toLocaleString()}</p>
          </div>
          <div class="divider"></div>
          <table>${itemsHtml}</table>
          <div class="divider"></div>
          <div style="display:flex; justify-content:space-between">
            <span>Subtotal:</span><span>$${sale.subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between">
            <span>IVA:</span><span>$${sale.tax.toFixed(2)}</span>
          </div>
          ${sale.roundingAmount !== 0 ? `
            <div style="display:flex; justify-content:space-between">
              <span>Redondeo:</span><span>-$${sale.roundingAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total">TOTAL: $${(sale.total - sale.roundingAmount).toFixed(2)}</div>
          <div class="divider"></div>
          <div style="margin-top:5px"><strong>Pagos:</strong></div>
          ${paymentsHtml}
          <div class="divider"></div>
          <p style="text-align:center">¡Gracias por su compra!</p>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getInvoiceTypeColor = (type: string) => {
    switch(type) {
      case 'A': return 'primary';
      case 'B': return 'secondary';
      case 'C': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Historial de Ventas</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Comprobante</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Métodos de Pago</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} hover>
                  <TableCell>
                    {new Date(sale.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={sale.invoiceType === 'TICKET_NO_FISCAL' ? 'Ticket' : `Fac. ${sale.invoiceType}`} 
                        size="small" 
                        color={getInvoiceTypeColor(sale.invoiceType) as any}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {sale.invoiceNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    ${(sale.total - sale.roundingAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {sale.payments.map(p => p.method).join(', ')}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" color="info">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Re-imprimir">
                      <IconButton size="small" color="primary" onClick={() => handlePrint(sale)}>
                        <Print />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" sx={{ py: 3 }} color="textSecondary">
                      No se encontraron ventas registradas
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
