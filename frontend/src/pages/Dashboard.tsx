import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Snackbar, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
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
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { analyticsAPI, testAPI } from '../services/api';

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
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Create test return item
  const handleCreateTestReturn = async () => {
    setLoading(true);
    try {
      await testAPI.createTestReturn();
      setSnackbar({
        open: true,
        message: 'Test return item created successfully!',
        severity: 'success'
      });
      fetchDashboardData(); // Refresh data after creating test return
    } catch (error) {
      console.error('Error creating test return:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create test return item.',
        severity: 'error'
      });
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

  return (
    <Box>
      {/* Test button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateTestReturn}
          sx={{ borderRadius: 2 }}
        >
          Create Test Return
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(66, 133, 244, 0.1)', 
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <ScheduleIcon sx={{ color: '#4285f4', fontSize: '1.125rem' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Pending
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
                {summaryData.pending_count}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <AccessTimeIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                {getRelativeTime(lastUpdated)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(52, 168, 83, 0.1)', 
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <CheckCircleIcon sx={{ color: '#34a853', fontSize: '1.125rem' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Completed
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
                {summaryData.completed_count}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <AccessTimeIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                {getRelativeTime(lastUpdated)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(251, 188, 4, 0.1)', 
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <LocalShippingIcon sx={{ color: '#fbbc04', fontSize: '1.125rem' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Processing
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
                {summaryData.processing_count}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <AccessTimeIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                {getRelativeTime(lastUpdated)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(234, 67, 53, 0.1)', 
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <WarningIcon sx={{ color: '#ea4335', fontSize: '1.125rem' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Rejected
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
                {summaryData.rejected_count}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <AccessTimeIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                {getRelativeTime(lastUpdated)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}>
              Average Processing Time
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem' }}>
                  {summaryData.avg_processing_time !== undefined && summaryData.avg_processing_time !== null
                    ? summaryData.avg_processing_time.toFixed(1)
                    : '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
                  hours
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}>
              Total Refund Amount
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem' }}>
                  ¥{summaryData.total_refund_amount !== undefined && summaryData.total_refund_amount !== null
                    ? summaryData.total_refund_amount.toFixed(2)
                    : '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
                  yuan
                </Typography>
              </Box>
            )}
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
                : 'No activity data available. Click "Create Test Return" button to generate test data.'
              }
            </Typography>
            
            <List>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      {activity.action.includes("New") ? (
                        <NotificationsActiveIcon color="primary" />
                      ) : activity.action.includes("processed") ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <LocalShippingIcon color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${activity.action}${activity.return_id ? ` #${activity.return_id}` : ''}`}
                      secondary={getRelativeTime(activity.timestamp)}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent activity" />
                </ListItem>
              )}
            </List>
          </>
        )}
      </Paper>

      {/* AI Recommendations */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 500 }}>
          AI Recommendations
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {summaryData.pending_count > 0 
              ? `You have ${summaryData.pending_count} pending return items that need attention. We recommend prioritizing these to improve customer satisfaction.`
              : 'No return items requiring immediate attention. System is running smoothly.'
            }
          </Typography>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 