import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CardHeader, Divider } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 400 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
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
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <ScheduleIcon sx={{ color: '#4285f4', fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Pending Returns
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem', mb: 1 }}>
              24
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" color="#34a853" sx={{ fontSize: '0.75rem' }}>
                Up from last week +8%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
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
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <TrendingUpIcon sx={{ color: '#ea4335', fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Returns This Month
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem', mb: 1 }}>
              142
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingDownIcon sx={{ color: '#ea4335', fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" color="#ea4335" sx={{ fontSize: '0.75rem' }}>
                Up from last month +12%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
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
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <CheckCircleIcon sx={{ color: '#34a853', fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Recovery Rate
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem', mb: 1 }}>
              78%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" color="#34a853" sx={{ fontSize: '0.75rem' }}>
                Up from last month +2%
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
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
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5
                }}
              >
                <ScheduleIcon sx={{ color: '#fbbc04', fontSize: '1.25rem' }} />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Average Processing Time
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem', mb: 1 }}>
              2.4 days
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <TrendingDownIcon sx={{ color: '#34a853', fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" color="#34a853" sx={{ fontSize: '0.75rem' }}>
                Down from last month -0.5 days
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Returns */}
        <Grid item xs={12}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
            }}
          >
            <CardHeader 
              title="Recent Returns" 
              titleTypographyProps={{ 
                variant: 'h6', 
                fontSize: '1rem',
                fontWeight: 500
              }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Recent return records will be displayed here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* AI Analysis */}
        <Grid item xs={12}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
            }}
          >
            <CardHeader 
              title="AI Analysis Insights" 
              titleTypographyProps={{ 
                variant: 'h6', 
                fontSize: '1rem',
                fontWeight: 500
              }}
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                AI-generated return analysis and insights will be displayed here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 