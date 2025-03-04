import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Data Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary cards */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              Total Returns
            </Typography>
            <Typography variant="h3">
              1,248
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +12% vs last month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              Return Amount
            </Typography>
            <Typography variant="h3">
              $152,480
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +8% vs last month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              Recovery Rate
            </Typography>
            <Typography variant="h3">
              78%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +2% vs last month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              Avg. Processing Time
            </Typography>
            <Typography variant="h3">
              2.4 days
            </Typography>
            <Typography variant="body2" color="text.secondary">
              -0.5 days vs last month
            </Typography>
          </Paper>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Return Trends" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Return trends chart will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Return Reasons Distribution" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Return reasons pie chart will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Product Category Analysis" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Product category analysis chart will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="AI Recommendation Analysis" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                AI recommendation analysis chart will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 