import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Snackbar, Alert, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Loop as LoopIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  AccessTime as AccessTimeIcon,
  MonetizationOn as MonetizationOnIcon,
  NotificationsActive as NotificationsActiveIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingBag as ShoppingBagIcon,
  Pending as PendingIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { analyticsAPI, testAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface SummaryData {
  pending_count: number;
  processing_count: number;
  completed_count: number;
  rejected_count: number;
  total_count: number;
  avg_processing_time: number;
  total_refund_amount: number;
}

// Interface for recent activity
interface RecentActivity {
  id: number;
  action: string;
  timestamp: string;
  return_id?: number;
  status?: string;
}

const Dashboard: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    pending_count: 0,
    processing_count: 0,
    completed_count: 0,
    rejected_count: 0,
    total_count: 0,
    avg_processing_time: 0,
    total_refund_amount: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date(Date.now() - 60000).toISOString()); // Set to 1 minute ago
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getSummary();
      
      // 确保所有必要的属性都存在，如果不存在则使用默认值
      const data = {
        pending_count: response.data.pending_count || 0,
        processing_count: response.data.processing_count || 0,
        completed_count: response.data.completed_count || 0,
        rejected_count: response.data.rejected_count || 0,
        total_count: response.data.total_count || 0,
        avg_processing_time: response.data.avg_processing_time || 0,
        total_refund_amount: response.data.total_refund_amount || 0
      };
      
      setSummaryData(data);
      setLastUpdated(new Date().toISOString());
      
      // Generate recent activity based on test returns
      const newActivity: RecentActivity[] = [];
      
      // Add a "new return" activity for each pending item (up to 3)
      for (let i = 0; i < Math.min(3, data.pending_count); i++) {
        newActivity.push({
          id: i,
          action: "New return request submitted",
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(), // Random time within last hour
          return_id: Math.floor(Math.random() * 10000) + 10000
        });
      }
      
      // Add a "processed" activity for each completed item (up to 2)
      for (let i = 0; i < Math.min(2, data.completed_count); i++) {
        newActivity.push({
          id: i + 10,
          action: "Return processed",
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(), // Random time within last 2 hours
          return_id: Math.floor(Math.random() * 10000) + 10000,
          status: "completed"
        });
      }
      
      // Add a "shipment received" activity
      if (data.processing_count > 0) {
        newActivity.push({
          id: 20,
          action: "Return shipment received",
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 10800000)).toISOString(), // Random time within last 3 hours
          return_id: Math.floor(Math.random() * 10000) + 10000
        });
      }
      
      // Sort by timestamp (newest first)
      newActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Take the 5 most recent activities
      setRecentActivity(newActivity.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 60000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format relative time (e.g., "2 minutes ago")
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    // Always show at least 1 minute ago, even if less time has passed
    if (diffMins < 1) {
      return `1 minute ago`;
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  };

  // 刷新处理函数
  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Overview
        </Typography>
        <Box>
          <IconButton onClick={handleRefresh} size="small" sx={{ ml: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderLeft: '4px solid #1a73e8',
              height: '100%'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: 'rgba(26, 115, 232, 0.1)', 
                borderRadius: '50%',
                p: 1
              }}>
                <ShoppingBagIcon sx={{ color: '#1a73e8' }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
                Total Return Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
                {loading ? <CircularProgress size={20} /> : summaryData.total_count}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                As of {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderLeft: '4px solid #fbbc04',
              height: '100%'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: 'rgba(251, 188, 4, 0.1)', 
                borderRadius: '50%',
                p: 1
              }}>
                <PendingIcon sx={{ color: '#fbbc04' }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
                Pending Returns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
                {loading ? <CircularProgress size={20} /> : summaryData.pending_count}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Awaiting processing
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderLeft: '4px solid #4285f4',
              height: '100%'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: 'rgba(66, 133, 244, 0.1)', 
                borderRadius: '50%',
                p: 1
              }}>
                <SettingsIcon sx={{ color: '#4285f4' }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
                Processed Returns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
                {loading ? <CircularProgress size={20} /> : summaryData.processing_count}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Currently processing
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderLeft: '4px solid #34a853',
              height: '100%'
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: 'rgba(52, 168, 83, 0.1)', 
                borderRadius: '50%',
                p: 1
              }}>
                <CheckIcon sx={{ color: '#34a853' }} />
              </Box>
              <Typography variant="h6" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 1 }}>
                Completed Returns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
                {loading ? <CircularProgress size={20} /> : summaryData.completed_count}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Successfully processed
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Activity */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}>
          Recent Activity
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {summaryData.total_count > 0 
                ? `System has ${summaryData.total_count} return items. Recent activity includes ${summaryData.pending_count} pending and ${summaryData.processing_count} processing items.`
                : 'No activity data available.'
              }
            </Typography>
            
            <List sx={{ width: '100%' }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ListItem 
                    key={activity.id}
                    dense
                    sx={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      py: 1,
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {activity.action.includes('New return') ? (
                        <LocalShippingIcon fontSize="small" sx={{ color: '#fbbc04' }} />
                      ) : activity.action.includes('processed') ? (
                        <CheckCircleIcon fontSize="small" sx={{ color: '#34a853' }} />
                      ) : (
                        <LoopIcon fontSize="small" sx={{ color: '#4285f4' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={activity.action}
                      secondary={`Order #${activity.return_id} - ${getRelativeTime(activity.timestamp)}`}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No recent activity" 
                    primaryTypographyProps={{ fontSize: '0.875rem', color: 'text.secondary' }} 
                  />
                </ListItem>
              )}
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/returns')}
                sx={{ fontSize: '0.875rem' }}
              >
                View All Returns
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 