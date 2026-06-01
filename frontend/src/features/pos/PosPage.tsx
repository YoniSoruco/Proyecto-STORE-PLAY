import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import PosProductSearch from './PosProductSearch';
import Cart from './Cart';
import Scanner from './Scanner';

const PosPage: React.FC = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Punto de Venta
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PosProductSearch />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Scanner />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Cart />
        </Grid>
      </Grid>
    </Container>
  );
};

export default PosPage;
