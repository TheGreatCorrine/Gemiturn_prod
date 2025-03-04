import React, { useState, useEffect } from 'react';
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
  QuestionAnswer as QuestionAnswerIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 220;

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Top navigation bar tab value
  const [tabValue, setTabValue] = useState(() => {
    if (location.pathname === '/' || location.pathname.startsWith('/returns')) return 0;
    if (location.pathname === '/analytics') return 1;
    return 0;
  });

  // 监听路径变化，更新tabValue
  React.useEffect(() => {
    if (location.pathname === '/' || location.pathname.startsWith('/returns')) {
      setTabValue(0);
    } else if (location.pathname === '/analytics') {
      setTabValue(1);
    }
  }, [location.pathname]);

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
        // 如果当前在returns页面，保持在returns页面
        if (location.pathname.startsWith('/returns')) {
          navigate('/returns');
        } else {
          navigate('/');
        }
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
    { text: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon fontSize="small" />, path: '/help' },
    { text: 'API Docs', icon: <CodeIcon fontSize="small" />, path: '/api-docs' },
  ];

  const drawer = (
    <div style={{ backgroundColor: '#f1f3f4', height: '100%' }}>
      <List sx={{ px: 1, mt: 1 }}>
        {returnMenuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ 
            mb: 0.25,
            pl: index > 0 ? 1.5 : 0, // 减少子菜单的缩进
          }}>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                borderRadius: 1,
                py: 0.6, // 稍微增加垂直内边距
                px: 1.5, // 增加水平内边距
                backgroundColor: index === 0 ? 'rgba(66, 133, 244, 0.08)' : 'transparent',
                color: index === 0 ? '#4285f4' : (item.isRed ? '#ea4335' : '#5f6368'),
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ 
                  minWidth: 30,
                  color: index === 0 ? '#4285f4' : (item.isRed ? '#ea4335' : '#5f6368')
                }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  fontWeight: index === 0 ? 500 : 400,
                  color: item.isRed ? '#ea4335' : (index === 0 ? '#4285f4' : '#5f6368')
                }} 
              />
              {item.count !== null && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    color: item.isRed ? '#ea4335' : '#5f6368',
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
      
      <Divider sx={{ my: 0.5, opacity: 0.6 }} />
      
      {/* Product Categories */}
      <List sx={{ px: 1, flex: '0 0 auto' }}>
        {categoryItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ 
            mb: 0.25,
            ...(item.isHeader ? { pointerEvents: 'none' } : {})
          }}>
            {item.isHeader ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem', 
                  color: '#5f6368',
                  fontWeight: 500,
                  px: 2,
                  py: 0.25
                }}
              >
                {item.text}
              </Typography>
            ) : (
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  borderRadius: 1,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.85rem',
                    color: '#5f6368'
                  }} 
                />
                {item.count !== null && (
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                    {item.count}
                  </Typography>
                )}
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 0.5, opacity: 0.6 }} />
      
      {/* Useful Links */}
      <List sx={{ px: 1 }}>
        {utilityItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ 
            mb: 0.25
          }}>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                borderRadius: 1,
                py: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 30, color: '#5f6368' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  color: '#5f6368'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
          backgroundColor: '#fff',
          color: '#202124',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: 0
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Box 
              component="img" 
              src="/logo.png" 
              alt="Logo" 
              sx={{ 
                width: 24, 
                height: 24, 
                mr: 1,
                display: 'inline-block',
                backgroundColor: '#4285f4',
                borderRadius: '4px'
              }} 
            />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 500, fontSize: '1.125rem' }}>
              Gemiturn
            </Typography>
          </Box>
          
          {/* Top Navigation Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              flexGrow: 0,
              marginRight: 2,
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#5f6368',
                textTransform: 'none',
                minHeight: { xs: 56, sm: 64 },
                '&.Mui-selected': {
                  color: '#1a73e8',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1a73e8',
                height: 3
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="AI Analysis" />
          </Tabs>
          
          {/* Search Bar */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: '#f1f3f4',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              mx: 2
            }}
          >
            <SearchIcon sx={{ color: '#5f6368', mr: 1 }} />
            <input
              placeholder="Search returns, products, orders..."
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                fontSize: '0.875rem',
                color: '#202124'
              }}
            />
          </Box>
          
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
      
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: 'none'
            },
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
              top: 64,
              height: 'calc(100% - 64px)',
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: 'none'
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
          ml: { sm: `${drawerWidth}px` },
          mt: { xs: '56px', sm: '64px' }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 