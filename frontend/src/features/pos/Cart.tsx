import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, removeItem, updateItemQuantity, clearCheckoutError } from './posCartSlice';
import PaymentDialog from './PaymentDialog';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totals, checkoutLoading, checkoutError } = useAppSelector((state) => state.posCart);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0 || checkoutLoading) return;
    setPaymentOpen(true);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Carrito de Compras
        </Typography>

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            El carrito está vacío.
          </Typography>
        ) : (
          <List dense disablePadding>
            {items.map((item) => (
              <ListItem
                key={item.productId}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => dispatch(removeItem(item.productId))}
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ px: 0 }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <IconButton
                        size="small"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          dispatch(
                            updateItemQuantity({
                              productId: item.productId,
                              quantity: item.quantity - 1,
                            }),
                          )
                        }
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          dispatch(
                            addItem({
                              productId: item.productId,
                              name: item.name,
                              price: item.price,
                              quantity: 1,
                            }),
                          )
                        }
                        aria-label={`Aumentar cantidad de ${item.name}`}
                      >
                        <AddCircleIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ ml: 'auto' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2">
          Artículos: {totals.itemCount}
        </Typography>
        <Typography variant="body2">
          Subtotal: ${totals.subtotal.toFixed(2)}
        </Typography>
        <Typography variant="body2">
          IVA (8%): ${totals.tax.toFixed(2)}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Total: ${totals.total.toFixed(2)}
        </Typography>

        {checkoutError && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => dispatch(clearCheckoutError())}>
            {checkoutError}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={items.length === 0 || checkoutLoading}
          onClick={handleCheckout}
        >
          {checkoutLoading ? <CircularProgress size={24} color="inherit" /> : 'Cobrar'}
        </Button>

        <PaymentDialog 
          open={paymentOpen} 
          onClose={() => setPaymentOpen(false)} 
          items={items} 
          totals={totals} 
        />
      </CardContent>
    </Card>
  );
};

export default Cart;
