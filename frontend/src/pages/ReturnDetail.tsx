import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert
} from '@mui/material';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// 定义退货订单类型
interface ReturnItem {
  id: number;
  order_id: string;
  product_id: string;
  product_name: string;
  product_category: string;
  return_reason: string;
  customer_description: string;
  original_price: number;
  ai_analysis: {
    category: string;
    reason: string;
    recommendation: string;
    confidence: number;
  } | null;
  status: string;
  resale_price?: number | null;
  created_at: string;
  updated_at: string;
}

const ReturnDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [returnItem, setReturnItem] = useState<ReturnItem | null>(null);
  const [status, setStatus] = useState<string>('');
  const [resalePrice, setResalePrice] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 获取退货订单详情
  useEffect(() => {
    const fetchReturnDetail = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('未找到认证令牌，请先登录');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_URL}/returns/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`获取退货订单详情失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('获取到的退货订单详情:', data);
        
        setReturnItem(data);
        setStatus(data.status);
        setResalePrice(data.resale_price);
      } catch (err: any) {
        console.error('获取退货订单详情错误:', err);
        setError(err.message || '获取退货订单详情失败');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchReturnDetail();
    }
  }, [id]);

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleResalePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResalePrice(parseFloat(event.target.value));
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('未找到认证令牌，请先登录');
        return;
      }
      
      const response = await fetch(`${API_URL}/returns/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status,
          resale_price: resalePrice,
          notes
        })
      });
      
      if (!response.ok) {
        throw new Error(`更新退货订单失败: ${response.status} ${response.statusText}`);
      }
      
      const updatedData = await response.json();
      setReturnItem(updatedData);
      setSaveSuccess(true);
      
      // 3秒后隐藏成功提示
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('更新退货订单错误:', err);
      setError(err.message || '更新退货订单失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not processed';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/returns')}
          sx={{ mt: 2 }}
        >
          返回列表
        </Button>
      </Box>
    );
  }

  if (!returnItem) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">未找到退货订单</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/returns')}
          sx={{ mt: 2 }}
        >
          返回列表
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          退货订单详情 #{id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/returns')}>
          返回列表
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          更新成功
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              基本信息
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  订单编号
                </Typography>
                <Typography variant="body1">
                  {returnItem.order_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  商品编号
                </Typography>
                <Typography variant="body1">
                  {returnItem.product_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  商品名称
                </Typography>
                <Typography variant="body1">
                  {returnItem.product_name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  商品类别
                </Typography>
                <Typography variant="body1">
                  {returnItem.product_category}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  原始价格
                </Typography>
                <Typography variant="body1">
                  ¥{returnItem.original_price.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  状态
                </Typography>
                <Chip 
                  label={getStatusText(returnItem.status)} 
                  color={getStatusColor(returnItem.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  创建时间
                </Typography>
                <Typography variant="body1">
                  {formatDate(returnItem.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  更新时间
                </Typography>
                <Typography variant="body1">
                  {formatDate(returnItem.updated_at)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              退货原因
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              客户提供的原因
            </Typography>
            <Typography variant="body1" paragraph>
              {returnItem.return_reason}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              客户描述
            </Typography>
            <Typography variant="body1" paragraph>
              {returnItem.customer_description}
            </Typography>
          </Paper>
        </Grid>

        {/* AI Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="AI 分析结果" 
              subheader={returnItem.ai_analysis ? 
                `置信度: ${(returnItem.ai_analysis.confidence * 100).toFixed(0)}%` : 
                '无AI分析结果'}
            />
            <CardContent>
              {returnItem.ai_analysis ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      分类
                    </Typography>
                    <Typography variant="body1">
                      {returnItem.ai_analysis.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      原因
                    </Typography>
                    <Typography variant="body1">
                      {returnItem.ai_analysis.reason}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      建议
                    </Typography>
                    <Chip 
                      label={returnItem.ai_analysis.recommendation}
                      color="primary"
                      size="small"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  该退货订单没有AI分析结果
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Process Return
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Resale Price"
                  type="number"
                  value={resalePrice || ''}
                  onChange={handleResalePriceChange}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Processing Notes"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={handleNotesChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReturnDetail; 