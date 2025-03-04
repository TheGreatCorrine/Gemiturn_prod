import React, { useState } from 'react';
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
  SelectChangeEvent
} from '@mui/material';

// 模拟数据
const mockReturn = {
  id: 1,
  order_id: 'ORD-12345',
  product_id: 'PROD-789',
  product_name: '智能手表',
  product_category: '电子产品',
  return_reason: '产品损坏',
  customer_description: '收到的手表屏幕有划痕，按钮也不灵敏。',
  image_urls: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  ai_category: '物理损坏',
  ai_reason: '运输过程中的损坏',
  ai_recommendation: '折扣转售',
  ai_confidence: 0.85,
  status: 'pending',
  original_price: 1299.00,
  resale_price: null,
  created_at: '2023-11-15T10:30:00Z',
  updated_at: '2023-11-15T10:30:00Z',
  processed_at: null
};

const ReturnDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState(mockReturn.status);
  const [resalePrice, setResalePrice] = useState<number | null>(mockReturn.resale_price);
  const [notes, setNotes] = useState('');

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleResalePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResalePrice(parseFloat(event.target.value));
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  const handleSave = () => {
    // 这里会调用API保存更改
    console.log('保存更改:', { status, resalePrice, notes });
    alert('更改已保存');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
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
        return '待处理';
      case 'approved':
        return '已批准';
      case 'completed':
        return '已完成';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未处理';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          退货详情 #{id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/returns')}>
          返回列表
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* 基本信息 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              基本信息
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  订单号
                </Typography>
                <Typography variant="body1">
                  {mockReturn.order_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  产品ID
                </Typography>
                <Typography variant="body1">
                  {mockReturn.product_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  产品名称
                </Typography>
                <Typography variant="body1">
                  {mockReturn.product_name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  产品类别
                </Typography>
                <Typography variant="body1">
                  {mockReturn.product_category}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  原始价格
                </Typography>
                <Typography variant="body1">
                  ¥{mockReturn.original_price.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  状态
                </Typography>
                <Chip 
                  label={getStatusText(mockReturn.status)} 
                  color={getStatusColor(mockReturn.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  创建时间
                </Typography>
                <Typography variant="body1">
                  {formatDate(mockReturn.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  处理时间
                </Typography>
                <Typography variant="body1">
                  {formatDate(mockReturn.processed_at)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 客户信息 */}
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
              {mockReturn.return_reason}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              客户描述
            </Typography>
            <Typography variant="body1" paragraph>
              {mockReturn.customer_description}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              图片
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {mockReturn.image_urls.map((url, index) => (
                <Box 
                  key={index}
                  component="img"
                  src="https://via.placeholder.com/150"
                  alt={`退货图片 ${index + 1}`}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    objectFit: 'cover',
                    border: '1px solid #eee',
                    borderRadius: 1
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* AI分析 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="AI分析" 
              subheader={`置信度: ${(mockReturn.ai_confidence * 100).toFixed(0)}%`}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    分类
                  </Typography>
                  <Typography variant="body1">
                    {mockReturn.ai_category}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    原因
                  </Typography>
                  <Typography variant="body1">
                    {mockReturn.ai_reason}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    建议
                  </Typography>
                  <Typography variant="body1">
                    {mockReturn.ai_recommendation}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 处理表单 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              处理退货
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">状态</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    label="状态"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="pending">待处理</MenuItem>
                    <MenuItem value="approved">已批准</MenuItem>
                    <MenuItem value="completed">已完成</MenuItem>
                    <MenuItem value="rejected">已拒绝</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="转售价格"
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
                  label="处理备注"
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
                  保存更改
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