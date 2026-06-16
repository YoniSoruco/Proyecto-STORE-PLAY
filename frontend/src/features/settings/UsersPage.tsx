import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Avatar, CircularProgress, Tooltip
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Delete from '@mui/icons-material/Delete';
import Email from '@mui/icons-material/Email';
import Badge from '@mui/icons-material/Badge';
import Store from '@mui/icons-material/Store';
import apiClient from '@/api/client';
import { type UserRole } from '@/features/auth/authSlice';

interface Member {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  branchId: number | null;
  branchName: string;
  active: boolean;
}

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenOpenDialog] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [branchId, setBranchId] = useState<string>('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Member[]>('/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error cargando miembros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await apiClient.post('/api/members', {
        email,
        fullName,
        role,
        branchId: branchId ? Number(branchId) : null
      });
      setOpenOpenDialog(false);
      resetForm();
      loadMembers();
    } catch (error) {
      console.error('Error agregando miembro:', error);
      alert('Error al invitar al usuario. Puede que ya sea miembro o los datos sean inválidos.');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar a este empleado?')) return;
    try {
      await apiClient.delete(`/api/members/${id}`);
      loadMembers();
    } catch (error) {
      console.error('Error eliminando miembro:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setRole('EMPLOYEE');
    setBranchId('');
  };

  const getRoleColor = (role: UserRole) => {
    switch(role) {
      case 'SUPERADMIN': return 'error';
      case 'OWNER': return 'warning';
      case 'ADMIN': return 'info';
      default: return 'success';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Gestión de Empleados</Typography>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />} 
          onClick={() => setOpenOpenDialog(true)}
        >
          Invitar Empleado
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Sucursal</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.9rem' }}>
                        {member.fullName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {member.fullName || 'Invitado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="inherit" color="action" />
                      <Typography variant="body2">{member.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={member.role} 
                      size="small" 
                      color={getRoleColor(member.role) as any} 
                      variant="outlined"
                      sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store fontSize="inherit" color="action" />
                      <Typography variant="body2">{member.branchName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar acceso">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={member.role === 'OWNER'} // No dejar que se auto-eliminen o eliminen dueños por ahora
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" sx={{ py: 3 }} color="textSecondary">
                      No hay empleados registrados en este negocio.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialogo de Invitación */}
      <Dialog open={openDialog} onClose={() => setOpenOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Invitar nuevo miembro</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Correo Electrónico"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              slotProps={{
                input: {
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }
              }}
            />
            <TextField
              label="Nombre Completo"
              fullWidth
              variant="outlined"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre del empleado"
              slotProps={{
                input: {
                  startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />
                }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={role}
                label="Rol"
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <MenuItem value="ADMIN">Administrador (Sucursal)</MenuItem>
                <MenuItem value="EMPLOYEE">Empleado (Cajero)</MenuItem>
                <MenuItem value="OWNER">Dueño (Gestión total)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                value={branchId}
                label="Sucursal"
                onChange={(e) => setBranchId(e.target.value)}
              >
                <MenuItem value="">Todas las sucursales</MenuItem>
                <MenuItem value="1">Sucursal Central</MenuItem>
                <MenuItem value="2">Sucursal Norte</MenuItem>
                <MenuItem value="3">Sucursal Sur</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenOpenDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleAddMember}
            disabled={!email || !fullName}
          >
            Vincular Usuario
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
