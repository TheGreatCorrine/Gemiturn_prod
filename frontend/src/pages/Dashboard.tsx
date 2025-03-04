import React from 'react';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <Box>
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
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
              24
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                +8% vs last week
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
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
              892
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                +12% vs last month
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
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
              45
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                +3% vs last week
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
                Problems
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem', mb: 1 }}>
              18
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5, transform: 'rotate(180deg)' }} />
              <Typography variant="body2" sx={{ color: '#ea4335', fontSize: '0.75rem' }}>
                -2% vs last week
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Returns */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f4' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Recent Activity
          </Typography>
        </Box>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Typography variant="body2" sx={{ color: '#5f6368', fontStyle: 'italic' }}>
            Recent return activity will be displayed here
          </Typography>
        </Box>
      </Paper>

      {/* AI Recommendations */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f4', backgroundColor: 'rgba(66, 133, 244, 0.05)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1a73e8' }}>
            AI Recommendations
          </Typography>
        </Box>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <Typography variant="body2" sx={{ color: '#5f6368', fontStyle: 'italic' }}>
            AI-powered recommendations will be displayed here
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard; 