import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
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
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getSummary();
      setSummaryData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('无法加载仪表板数据。使用默认值。');
      // 保持默认值
    } finally {
      setLoading(false);
    }
  };

  // 创建测试退货项
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

  // 关闭提示框
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Box>
      {/* 测试按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateTestReturn}
          sx={{ borderRadius: 2 }}
        >
          创建测试退货
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
                待处理
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
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                刚刚更新
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
                已完成
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
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                刚刚更新
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
                处理中
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
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                刚刚更新
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
                已拒绝
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
              <TrendingUpIcon sx={{ color: '#34a853', fontSize: '0.875rem', mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#34a853', fontSize: '0.75rem' }}>
                刚刚更新
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
              平均处理时间
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem' }}>
                  {summaryData.avg_processing_time.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
                  小时
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
              总退款金额
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.5rem' }}>
                  ¥{summaryData.total_refund_amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, mb: 0.5 }}>
                  元
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity and AI Recommendations */}
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
          最近活动
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {summaryData.total_count > 0 
              ? `系统中共有 ${summaryData.total_count} 个退货项。最近的活动包括 ${summaryData.pending_count} 个待处理项和 ${summaryData.processing_count} 个处理中项。`
              : '暂无活动数据。点击"创建测试退货"按钮生成一些测试数据。'
            }
          </Typography>
        )}
      </Paper>

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
          AI 建议
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {summaryData.pending_count > 0 
              ? `您有 ${summaryData.pending_count} 个待处理的退货项需要关注。建议优先处理这些项目以提高客户满意度。`
              : '目前没有需要立即关注的退货项。系统运行良好。'
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