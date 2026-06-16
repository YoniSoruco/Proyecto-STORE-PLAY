import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Collapse,
  Chip,
  Stack
} from '@mui/material';
import Menu from '@mui/icons-material/Menu';
import Dashboard from '@mui/icons-material/Dashboard';
import Inventory2 from '@mui/icons-material/Inventory2';
import PointOfSale from '@mui/icons-material/PointOfSale';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Settings from '@mui/icons-material/Settings';
import People from '@mui/icons-material/People';
import Store from '@mui/icons-material/Store';
import Business from '@mui/icons-material/Business';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import History from '@mui/icons-material/History';
import Assessment from '@mui/icons-material/Assessment';
import Category from '@mui/icons-material/Category';
import Receipt from '@mui/icons-material/Receipt';
import Logout from '@mui/icons-material/Logout';

import { useThemeMode } from '@/theme/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setContext, logout, type UserRole } from '@/features/auth/authSlice';
import { setTenantId as setActiveTenantId } from '@/features/tenant/tenantSlice';
import { fetchProducts } from '@/features/inventory/inventorySlice';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  module?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Inicio', path: '/', icon: <Dashboard /> },
  {
    label: 'Ventas',
    icon: <PointOfSale />,
    module: 'POS',
    children: [
      { label: 'Punto de Venta', path: '/pos', icon: <Receipt /> },
      { label: 'Historial', path: '/sales/history', icon: <History /> },
    ],
  },
  {
    label: 'Inventario',
    icon: <Inventory2 />,
    module: 'INVENTORY',
    children: [
      { label: 'Productos', path: '/inventory', icon: <Category /> },
      { label: 'Stock (Lotes)', path: '/inventory/stock', icon: <Inventory2 /> },
      { label: 'Proveedores', path: '/suppliers', icon: <LocalShipping /> },
    ],
  },
  {
    label: 'Reportes',
    icon: <Assessment />,
    roles: ['SUPERADMIN', 'OWNER', 'ADMIN'],
    module: 'REPORTS',
    children: [
      { label: 'Arqueos de Caja', path: '/reports/cash', icon: <Assessment /> },
      { label: 'Ventas Diarias', path: '/reports/sales', icon: <Assessment /> },
      { label: 'Stock Crítico', path: '/reports/inventory', icon: <Assessment /> },
    ],
  },
  {
    label: 'Configuración',
    icon: <Settings />,
    roles: ['SUPERADMIN', 'OWNER', 'ADMIN'],
    children: [
      { label: 'Empleados', path: '/settings/users', icon: <People />, roles: ['SUPERADMIN', 'OWNER', 'ADMIN'] },
      { label: 'Sucursales', path: '/settings/branches', icon: <Store />, roles: ['SUPERADMIN', 'OWNER'], module: 'BRANCHES' },
      { label: 'Negocios', path: '/settings/tenants', icon: <Business />, roles: ['SUPERADMIN'] },
    ],
  },
];

interface AppLayoutProps {
  children?: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Ventas: true,
    Inventario: true,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggle } = useThemeMode();
  const dispatch = useAppDispatch();
  const { user, activeContext } = useAppSelector((state) => state.auth);

  const activeTenantAccess = user?.availableTenants.find(t => t.tenantId === activeContext?.tenantId);
  const appBarColor = activeTenantAccess?.primaryColor || '#1976d2';
  const enabledModules = activeTenantAccess?.features || [];

  const handleRoleChange = (newRole: UserRole) => {
    if (activeContext) {
      dispatch(setContext({ ...activeContext, role: newRole }));
      dispatch(fetchProducts());
    }
  };

  const handleBranchChange = (newBranchId: number) => {
    if (activeContext) {
      dispatch(setContext({ ...activeContext, branchId: newBranchId }));
      dispatch(fetchProducts());
    }
  };

  const handleTenantChange = (newTenantId: string) => {
    const access = user?.availableTenants.find(t => t.tenantId === newTenantId);
    if (access) {
      dispatch(setContext({
        tenantId: access.tenantId,
        branchId: access.branchId,
        role: access.role
      }));
      dispatch(setActiveTenantId(newTenantId));
      dispatch(fetchProducts());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items
      .filter(item => {
        const roleAllowed = !item.roles || (activeContext && item.roles.includes(activeContext.role));
        const moduleAllowed = !item.module || enabledModules.includes(item.module) || activeContext?.role === 'SUPERADMIN';
        return roleAllowed && moduleAllowed;
      })
      .map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.label];

        if (hasChildren) {
          return (
            <Box key={item.label}>
              <ListItemButton onClick={() => toggleMenu(item.label)} sx={{ pl: level * 2 + 2 }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography sx={{ fontWeight: level === 0 ? 'bold' : 'normal' }}>
                      {item.label}
                    </Typography>
                  } 
                />
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderNavItems(item.children!, level + 1)}
                </List>
              </Collapse>
            </Box>
          );
        }

        return (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              if (item.path) {
                navigate(item.path);
                setMobileOpen(false);
              }
            }}
            sx={{
              pl: level * 2 + 2,
              ...(location.pathname === item.path ? { bgcolor: 'action.selected', borderRight: `4px solid ${appBarColor}` } : {}),
            }}
          >
            <ListItemIcon sx={location.pathname === item.path ? { color: appBarColor } : {}}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      });
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: appBarColor, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          {activeTenantAccess?.tenantName || 'STORE PLAY'}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 0 }}>
        {renderNavItems(navigation)}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          v2.0.0-SaaS
        </Typography>
      </Box>
    </Box>
  );

  const container = window !== undefined ? () => document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: appBarColor }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {activeTenantAccess?.verticalType} | {user?.email}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mr: 3, alignItems: 'center' }}>
            {(user?.availableTenants && user.availableTenants.length > 1) && (
              <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>Negocio</InputLabel>
                <Select
                  value={activeContext?.tenantId}
                  label="Negocio"
                  onChange={(e) => handleTenantChange(e.target.value as string)}
                  sx={{ color: 'white', fontSize: '0.8rem', '&:before': { borderColor: 'white' } }}
                >
                  {user.availableTenants.map(t => (
                    <MenuItem key={t.tenantId} value={t.tenantId}>{t.tenantName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl size="small" variant="standard" sx={{ minWidth: 80 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>Rol</InputLabel>
              <Select
                value={activeContext?.role || 'EMPLOYEE'}
                label="Rol"
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                sx={{ color: 'white', fontSize: '0.8rem', '&:before': { borderColor: 'white' } }}
              >
                <MenuItem value="SUPERADMIN">S-Admin</MenuItem>
                <MenuItem value="OWNER">Dueño</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="EMPLOYEE">Empleado</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" variant="standard" sx={{ minWidth: 100 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>Sucursal</InputLabel>
              <Select
                value={activeContext?.branchId || 1}
                label="Sucursal"
                onChange={(e) => handleBranchChange(Number(e.target.value))}
                sx={{ color: 'white', fontSize: '0.8rem', '&:before': { borderColor: 'white' } }}
              >
                <MenuItem value={1}>Central</MenuItem>
                <MenuItem value={2}>Norte</MenuItem>
                <MenuItem value={3}>Sur</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <IconButton color="inherit" onClick={toggle}>
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="persistent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: `${DRAWER_WIDTH}px` },
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
}

export default AppLayout;
