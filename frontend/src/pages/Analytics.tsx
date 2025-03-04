import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardHeader } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        数据分析
      </Typography>
      
      <Grid container spacing={3}>
        {/* 摘要卡片 */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              总退货数
            </Typography>
            <Typography variant="h3">
              1,248
            </Typography>
            <Typography variant="body2" color="text.secondary">
              较上月 +12%
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              退货金额
            </Typography>
            <Typography variant="h3">
              ¥152,480
            </Typography>
            <Typography variant="body2" color="text.secondary">
              较上月 +8%
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              回收率
            </Typography>
            <Typography variant="h3">
              78%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              较上月 +2%
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="primary">
              平均处理时间
            </Typography>
            <Typography variant="h3">
              2.4天
            </Typography>
            <Typography variant="body2" color="text.secondary">
              较上月 -0.5天
            </Typography>
          </Paper>
        </Grid>
        
        {/* 图表 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="退货趋势" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                这里将显示退货趋势图表
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="退货原因分布" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                这里将显示退货原因饼图
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="产品类别分析" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                这里将显示产品类别分析图表
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="AI推荐分析" />
            <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                这里将显示AI推荐分析图表
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 