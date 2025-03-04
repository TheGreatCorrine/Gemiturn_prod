import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        {/* Summary cards */}
        <Grid item xs={12} md={3}>
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
            <Typography variant="subtitle1" sx={{ color: '#4285f4', fontWeight: 500, mb: 1 }}>
              Total Returns
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              1,248
            </Typography>
            <Typography variant="body2" sx={{ color: '#5f6368' }}>
              +12% vs last month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
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
            <Typography variant="subtitle1" sx={{ color: '#0f9d58', fontWeight: 500, mb: 1 }}>
              Return Amount
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              $152,480
            </Typography>
            <Typography variant="body2" sx={{ color: '#5f6368' }}>
              +8% vs last month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
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
            <Typography variant="subtitle1" sx={{ color: '#ea4335', fontWeight: 500, mb: 1 }}>
              Recovery Rate
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              78%
            </Typography>
            <Typography variant="body2" sx={{ color: '#5f6368' }}>
              +2% vs last month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
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
            <Typography variant="subtitle1" sx={{ color: '#fbbc04', fontWeight: 500, mb: 1 }}>
              Avg. Processing Time
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 400, mb: 1 }}>
              3.2 days
            </Typography>
            <Typography variant="body2" sx={{ color: '#5f6368' }}>
              -0.5 days vs last month
            </Typography>
          </Paper>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f4' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Return Trends
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5f6368', fontStyle: 'italic', mb: 2 }}>
                This will display a chart showing return trends over time.
              </Typography>
              {/* Chart component would go here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#5f6368' }}>
                  Chart visualization
                </Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f4' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Return Reasons Distribution
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5f6368', fontStyle: 'italic', mb: 2 }}>
                This will display a pie chart showing distribution of return reasons.
              </Typography>
              {/* Chart component would go here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#5f6368' }}>
                  Pie chart visualization
                </Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.15), 0 1px 3px 0 rgba(60,64,67,0.1)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f4' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Product Category Analysis
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5f6368', fontStyle: 'italic', mb: 2 }}>
                This will display a chart analyzing returns by product category.
              </Typography>
              {/* Chart component would go here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#5f6368' }}>
                  Bar chart visualization
                </Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.15), 0 1px 3px 0 rgba(60,64,67,0.1)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #f1f3f4' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                AI Recommendation Analysis
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#5f6368', fontStyle: 'italic', mb: 2 }}>
                This will display a chart showing AI recommendation accuracy and impact.
              </Typography>
              {/* Chart component would go here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#5f6368' }}>
                  Line chart visualization
                </Typography>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 