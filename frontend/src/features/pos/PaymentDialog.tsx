import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Typography, Grid, Box, IconButton, List, ListItem, ListItemText,
  FormControl, InputLabel, Select, MenuItem, Divider, FormControlLabel, Switch
} from '@mui/material';
import { Add, Delete, AccountBalanceWallet, CreditCard, PointOfSale, SwapHoriz, Print, PrintDisabled } from '@mui/icons-material';
import { useAppDispatch } from '@/store/hooks';
import { submitSale, type CartItem, type CartTotals } from './posCartSlice';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totals: CartTotals;
}

const PAYMENT_METHODS = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: <PointOfSale /> },
  { id: 'DEBITO', label: 'Débito', icon: <CreditCard /> },
  { id: 'CREDITO', label: 'Crédito', icon: <CreditCard /> },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: <AccountBalanceWallet /> },
];

const INVOICE_TYPES = [
  { id: 'TICKET_NO_FISCAL', label: 'Ticket Común' },
  { id: 'B', label: 'Factura B (Cons. Final)' },
  { id: 'A', label: 'Factura A (Resp. Inscrip.)' },
  { id: 'C', label: 'Factura C (Monotributo)' },
];

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose, items, totals }) => {
  const dispatch = useAppDispatch();
  const [payments, setPayments] = useState<{ method: string; amount: number }[]>([]);
  const [currentAmount, setCurrentAmount] = useState('');
  const [currentMethod, setCurrentMethod] = useState('EFECTIVO');
  const [invoiceType, setInvoiceType] = useState('TICKET_NO_FISCAL');
  const [roundingAmount, setRoundingAmount] = useState(0);
  const [shouldPrint, setShouldPrint] = useState(true);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = parseFloat((totals.total - totalPaid).toFixed(2));

  useEffect(() => {
    if (open) {
      setPayments([]);
      setCurrentAmount(totals.total.toString());
      setRoundingAmount(0);
      setInvoiceType('TICKET_NO_FISCAL');
    }
  }, [open, totals.total]);

  const handleAddPayment = () => {
    const amount = parseFloat(currentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setPayments([...payments, { method: currentMethod, amount }]);
    
    const nextRemaining = parseFloat((remaining - amount).toFixed(2));
    setCurrentAmount(nextRemaining > 0 ? nextRemaining.toString() : '0');
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
    
    const newTotalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    setCurrentAmount(parseFloat((totals.total - newTotalPaid).toFixed(2)).toString());
  };

  const handleRounding = () => {
    const currentTotal = totals.total - roundingAmount;
    const rounded = Math.floor(currentTotal / 10) * 10;
    const diff = parseFloat((totals.total - rounded).toFixed(2));
    setRoundingAmount(diff);
    setPayments([]);
    setCurrentAmount(rounded.toString());
  };

  const handleCheckout = async () => {
    if (remaining !== 0 && remaining !== roundingAmount) {
      alert('El total pagado debe coincidir con el total de la venta (considerando el redondeo).');
      return;
    }

    try {
      const result = await dispatch(submitSale({ 
        items, 
        totals, 
        payments, 
        roundingAmount,
        invoiceType
      })).unwrap();
      
      if (shouldPrint) {
        handlePrint(result);
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = (sale: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = items.map(i => `
      <tr>
        <td style="text-align:left">${i.name} x${i.quantity}</td>
        <td style="text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const paymentsHtml = payments.map(p => `
      <div style="display:flex; justify-content:space-between">
        <span>${p.method}:</span>
        <span>$${p.amount.toFixed(2)}</span>
      </div>
    `).join('');

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
            <h2 style="margin:0">STORE PLAY</h2>
            <p style="margin:0">${invoiceType === 'TICKET_NO_FISCAL' ? 'NO VALIDO COMO FACTURA' : `FACTURA ${invoiceType}`}</p>
            <p style="margin:0">Nro: ${sale?.invoiceNumber || '—'}</p>
          </div>
          <div class="divider"></div>
          <table>${itemsHtml}</table>
          <div class="divider"></div>
          <div style="display:flex; justify-content:space-between">
            <span>Subtotal:</span><span>$${totals.subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between">
            <span>IVA:</span><span>$${totals.tax.toFixed(2)}</span>
          </div>
          ${roundingAmount !== 0 ? `
            <div style="display:flex; justify-content:space-between">
              <span>Redondeo:</span><span>-$${roundingAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total">TOTAL: $${(totals.total - roundingAmount).toFixed(2)}</div>
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Finalizar Venta
        <FormControlLabel
          control={
            <Switch 
              checked={shouldPrint} 
              onChange={(e) => setShouldPrint(e.target.checked)} 
              color="primary"
              size="small"
            />
          }
          label={shouldPrint ? <Print fontSize="small" color="primary" /> : <PrintDisabled fontSize="small" color="action" />}
        />
      </DialogTitle>
      <DialogContent dividers>
        
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Comprobante</InputLabel>
            <Select 
              value={invoiceType} 
              label="Tipo de Comprobante" 
              onChange={(e) => setInvoiceType(e.target.value)}
            >
              {INVOICE_TYPES.map(t => (
                <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
            Total: ${(totals.total - roundingAmount).toFixed(2)}
          </Typography>
          {roundingAmount !== 0 && (
            <Typography variant="caption" color="text.secondary">
              (Original: ${totals.total.toFixed(2)} - Redondeo: ${roundingAmount.toFixed(2)})
            </Typography>
          )}
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={{ xs: 7 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Método</InputLabel>
              <Select 
                value={currentMethod} 
                label="Método" 
                onChange={(e) => setCurrentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 5 }}>
            <TextField 
              label="Monto" 
              type="number" 
              size="small" 
              fullWidth 
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              startIcon={<Add />} 
              onClick={handleAddPayment}
              disabled={parseFloat(currentAmount) <= 0}
            >
              Agregar Pago
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }}>Pagos Registrados</Divider>

        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
          {payments.map((p, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => handleRemovePayment(index)}>
                  <Delete fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText 
                primary={PAYMENT_METHODS.find(m => m.id === p.method)?.label} 
                secondary={`$${p.amount.toFixed(2)}`} 
              />
            </ListItem>
          ))}
          {payments.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
              Sin pagos agregados
            </Typography>
          )}
        </List>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color={remaining === 0 ? "success.main" : "error.main"}>
            {remaining > 0 ? `Resta: $${remaining.toFixed(2)}` : remaining < 0 ? `Vuelto: $${Math.abs(remaining).toFixed(2)}` : 'Pagado'}
          </Typography>
          <Button 
            size="small" 
            startIcon={<SwapHoriz />} 
            onClick={handleRounding}
            color="secondary"
          >
            Redondear
          </Button>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleCheckout} 
          variant="contained" 
          disabled={payments.length === 0 || (remaining !== 0 && remaining !== roundingAmount)}
        >
          Confirmar Venta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
