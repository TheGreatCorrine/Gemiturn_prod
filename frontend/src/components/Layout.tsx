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
  Tab,
  CircularProgress
} from '@mui/material';
import {
  MenuOutlined as MenuIcon,
  DashboardOutlined as DashboardIcon,
  ReplayOutlined as ReplayIcon,
  BarChartOutlined as BarChartIcon,
  SettingsOutlined as SettingsIcon,
  LogoutOutlined as LogoutIcon,
  HelpOutline as HelpIcon,
  NotificationsOutlined as NotificationsIcon,
  CodeOutlined as CodeIcon,
  QuestionAnswerOutlined as QuestionAnswerIcon,
  SearchOutlined as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';

const drawerWidth = 220;

interface SummaryData {
  pending_count: number;
  processing_count: number;
  completed_count: number;
  rejected_count: number;
  total_count: number;
  avg_processing_time: number;
  total_refund_amount: number;
}

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [summaryData, setSummaryData] = useState<SummaryData>({
    pending_count: 0,
    processing_count: 0,
    completed_count: 0,
    rejected_count: 0,
    total_count: 0,
    avg_processing_time: 0,
    total_refund_amount: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Top navigation bar tab value
  const [tabValue, setTabValue] = useState(() => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/returns')) return 1;
    if (location.pathname === '/analytics') return 2;
    return -1; // 不选中任何标签
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getSummary();
      setSummaryData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Keep default values
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 60000);
    
    // Clean up timer
    return () => clearInterval(intervalId);
  }, []);

  // 监听路径变化，更新tabValue
  React.useEffect(() => {
    if (location.pathname === '/') {
      setTabValue(0);
    } else if (location.pathname.startsWith('/returns')) {
      setTabValue(1);
    } else if (location.pathname === '/analytics') {
      setTabValue(2);
    } else {
      setTabValue(-1); // 不选中任何标签
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
        // 始终导航到仪表盘/概览页面
        navigate('/');
        break;
      case 1:
        navigate('/returns');
        break;
      case 2:
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
    { text: 'Returns Management', icon: <ReplayIcon fontSize="small" />, path: '/returns', active: true, count: null },
    { text: 'Pending', icon: null, path: '/returns?status=pending', count: summaryData.pending_count },
    { text: 'Processing', icon: null, path: '/returns?status=processing', count: summaryData.processing_count },
    { text: 'Completed', icon: null, path: '/returns?status=completed', count: summaryData.completed_count },
    { text: 'Rejected', icon: null, path: '/returns?status=rejected', count: summaryData.rejected_count, isRed: true },
  ];

  const categoryItems = [
    { text: 'Product Categories', icon: null, path: '', isHeader: true },
    { text: 'Electronics', icon: null, path: '/returns?category=electronics', count: null },
    { text: 'Clothing & Accessories', icon: null, path: '/returns?category=clothing', count: null },
    { text: 'Home Goods', icon: null, path: '/returns?category=home', count: null },
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
                loading ? (
                  <CircularProgress size={16} sx={{ color: item.isRed ? '#ea4335' : '#5f6368' }} />
                ) : (
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
                )
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
                  loading ? (
                    <CircularProgress size={16} sx={{ color: '#5f6368' }} />
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#5f6368' }}>
                      {item.count}
                    </Typography>
                  )
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
            <Tab label="Returns" />
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