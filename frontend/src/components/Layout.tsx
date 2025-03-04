import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Replay as ReplayIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 256;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Top navigation bar tab value
  const [tabValue, setTabValue] = useState(() => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/analytics') return 1;
    return 0;
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/analytics');
        break;
      default:
        navigate('/');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const returnMenuItems = [
    { text: 'Returns Management', icon: <ReplayIcon />, path: '/returns', active: true, count: null },
    { text: 'Pending', icon: null, path: '/returns?status=pending', count: 127 },
    { text: 'Processing', icon: null, path: '/returns?status=processing', count: 45 },
    { text: 'Completed', icon: null, path: '/returns?status=completed', count: 892 },
    { text: 'Problem Returns', icon: null, path: '/returns?status=problem', count: 18, isRed: true },
  ];

  const categoryItems = [
    { text: 'Product Categories', icon: null, path: '', isHeader: true },
    { text: 'Electronics', icon: null, path: '/returns?category=electronics', count: 487 },
    { text: 'Clothing & Accessories', icon: null, path: '/returns?category=clothing', count: 325 },
    { text: 'Home Goods', icon: null, path: '/returns?category=home', count: 203 },
  ];

  const utilityItems = [
    { text: 'Useful Links', icon: null, path: '', isHeader: true },
    { text: 'API Documentation', icon: <CodeIcon />, path: '/api-docs' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help Center', icon: <QuestionAnswerIcon />, path: '/help' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ px: 2 }}>
        <Box 
          component="img" 
          src="/logo.png" 
          alt="Logo" 
          sx={{ 
            width: 32, 
            height: 32, 
            mr: 1,
            display: 'inline-block',
            backgroundColor: '#4285f4',
            borderRadius: '8px'
          }} 
        />
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 500, fontSize: '1.125rem' }}>
          Gemiturn
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Returns Management Menu */}
      <List sx={{ px: 1 }}>
        {returnMenuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ 
            mb: 0.5,
            pl: index > 0 ? 2 : 0, // Indent submenu
          }}>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                borderRadius: 1,
                py: 0.75,
                backgroundColor: index === 0 ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
                color: index === 0 ? '#4285f4' : (item.isRed ? '#ea4335' : 'inherit'),
                '&:hover': {
                  backgroundColor: index === 0 ? 'rgba(66, 133, 244, 0.15)' : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ 
                  minWidth: 40,
                  color: index === 0 ? '#4285f4' : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  fontWeight: index === 0 ? 500 : 400,
                  color: item.isRed ? '#ea4335' : 'inherit'
                }} 
              />
              {item.count !== null && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    color: item.isRed ? '#ea4335' : 'inherit',
                    fontWeight: item.isRed ? 500 : 400
                  }}
                >
                  {item.count}
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Product Categories */}
      <List sx={{ px: 1 }}>
        {categoryItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ 
            mb: 0.5,
            ...(item.isHeader && { pointerEvents: 'none' })
          }}>
            {item.isHeader ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem', 
                  color: '#5f6368',
                  fontWeight: 500,
                  px: 2,
                  py: 0.5
                }}
              >
                {item.text}
              </Typography>
            ) : (
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  borderRadius: 1,
                  py: 0.75
                }}
              >
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem'
                  }} 
                />
                {item.count !== null && (
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {item.count}
                  </Typography>
                )}
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Useful Links */}
      <List sx={{ px: 1 }}>
        {utilityItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ 
            mb: 0.5,
            ...(item.isHeader && { pointerEvents: 'none' })
          }}>
            {item.isHeader ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem', 
                  color: '#5f6368',
                  fontWeight: 500,
                  px: 2,
                  py: 0.5
                }}
              >
                {item.text}
              </Typography>
            ) : (
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  borderRadius: 1,
                  py: 0.75
                }}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                )}
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem'
                  }} 
                />
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
          backgroundColor: '#fff',
          color: '#202124'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Top Navigation Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              flexGrow: 1,
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#5f6368',
                textTransform: 'none',
                '&.Mui-selected': {
                  color: '#1a73e8',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1a73e8',
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="AI Analysis" />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Help">
              <IconButton sx={{ mx: 0.5 }}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton sx={{ mx: 0.5 }}>
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.username || 'User'}>
              <IconButton 
                onClick={handleUserMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#1a73e8',
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem sx={{ fontSize: '0.875rem' }}>
                <Avatar sx={{ bgcolor: '#1a73e8' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                    {user?.email || 'user@example.com'}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ fontSize: '0.875rem' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #e0e0e0',
              boxShadow: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 