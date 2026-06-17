import { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Chip, Avatar, CircularProgress, Tooltip, OutlinedInput
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Delete from '@mui/icons-material/Delete';
import Email from '@mui/icons-material/Email';
import Badge from '@mui/icons-material/Badge';
import Store from '@mui/icons-material/Store';
import Phone from '@mui/icons-material/Phone';
import apiClient from '@/api/client';
import { type UserRole } from '@/features/auth/authSlice';

interface Member {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  branchIds: number[];
  active: boolean;
}

interface Branch {
  id: number;
  name: string;
}

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenOpenDialog] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [branchIds, setBranchIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, branchesRes] = await Promise.all([
        apiClient.get<Member[]>('/api/members'),
        apiClient.get<Branch[]>('/api/branches')
      ]);
      setMembers(membersRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await apiClient.post('/api/members', {
        email,
        fullName,
        phoneNumber,
        role,
        branchIds
      });
      setOpenOpenDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error agregando miembro:', error);
      alert('Error al invitar al usuario. Puede que ya sea miembro o los datos sean inválidos.');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('¿Estás seguro de que querés eliminar a este empleado?')) return;
    try {
      await apiClient.delete(`/api/members/${id}`);
      loadData();
    } catch (error) {
      console.error('Error eliminando miembro:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setPhoneNumber('');
    setRole('EMPLOYEE');
    setBranchIds([]);
  };

  const getRoleColor = (role: UserRole) => {
    switch(role) {
      case 'SUPERADMIN': return 'error';
      case 'OWNER': return 'warning';
      case 'ADMIN': return 'info';
      default: return 'success';
    }
  };

  const getBranchNames = (ids: number[]) => {
    if (!ids || ids.length === 0) return 'Todas';
    return ids.map(id => branches.find(b => b.id === id)?.name || `Suc. ${id}`).join(', ');
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
                <TableCell>Email / Tel</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Sucursales</TableCell>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="inherit" color="action" />
                        <Typography variant="caption">{member.email}</Typography>
                      </Box>
                      {member.phoneNumber && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone fontSize="inherit" color="action" />
                          <Typography variant="caption">{member.phoneNumber}</Typography>
                        </Box>
                      )}
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
                      <Typography variant="body2">{getBranchNames(member.branchIds)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar acceso">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={member.role === 'OWNER'} 
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
              slotProps={{ input: { startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> } }}
            />
            <TextField
              label="Nombre Completo"
              fullWidth
              variant="outlined"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre del empleado"
              slotProps={{ input: { startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} /> } }}
            />
            <TextField
              label="Teléfono (WhatsApp)"
              fullWidth
              variant="outlined"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+54 9 ..."
              slotProps={{ input: { startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> } }}
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
              <InputLabel>Sucursales</InputLabel>
              <Select
                multiple
                value={branchIds}
                onChange={(e) => setBranchIds(typeof e.target.value === 'string' ? [] : e.target.value)}
                input={<OutlinedInput label="Sucursales" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0 ? 'Todas' : selected.map((id) => (
                      <Chip key={id} label={branches.find(b => b.id === id)?.name || id} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem disabled value="">
                  <em>Selecciona sucursales</em>
                </MenuItem>
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Vacio = Acceso a todas las sucursales
              </Typography>
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
