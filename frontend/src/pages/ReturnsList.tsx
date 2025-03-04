import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

// 模拟数据
const mockReturns = [
  {
    id: 1,
    order_id: 'RET-20240303-001',
    product_id: 'SW-200',
    product_name: '智能手表',
    return_reason: '功能不符合预期',
    status: 'processing',
    created_at: '2024-03-03T10:30:00Z',
    original_price: 1299,
    ai_recommendation: '二次销售',
    ai_confidence: 0.92,
    resale_price: 1039
  },
  {
    id: 2,
    order_id: 'RET-20240303-002',
    product_id: 'AE-100',
    product_name: '蓝牙耳机',
    return_reason: '配对问题',
    status: 'pending',
    created_at: '2024-03-03T11:45:00Z',
    original_price: 499,
    ai_recommendation: '维修后销售',
    ai_confidence: 0.87,
    resale_price: 349
  },
  {
    id: 3,
    order_id: 'RET-20240303-003',
    product_id: 'KB-750',
    product_name: '机械键盘',
    return_reason: '按键不灵敏',
    status: 'completed',
    created_at: '2024-03-03T09:15:00Z',
    original_price: 899,
    ai_recommendation: '退回厂商',
    ai_confidence: 0.95,
    resale_price: 0
  }
];

const ReturnsList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productCategory, setProductCategory] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  
  const navigate = useNavigate();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleProductCategoryChange = (event: SelectChangeEvent) => {
    setProductCategory(event.target.value);
  };
  
  const handleReturnReasonChange = (event: SelectChangeEvent) => {
    setReturnReason(event.target.value);
  };
  
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };
  
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    setDateRange(event.target.value);
  };
  
  const handleSearch = () => {
    // 实现搜索逻辑
    console.log('搜索条件:', { productCategory, returnReason, status, dateRange });
  };
  
  const handleBatchProcess = () => {
    // 实现批量处理逻辑
    console.log('批量处理');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF7E0',
          color: '#F29D12',
          text: '待处理'
        };
      case 'processing':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
          text: '处理中'
        };
      case 'completed':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
          text: '已完成'
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
          text: '未知'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  const handleRowClick = (id: number) => {
    navigate(`/returns/${id}`);
  };
  
  const getAIRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case '二次销售':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
        };
      case '维修后销售':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
        };
      case '退回厂商':
        return {
          bg: '#FFF3E0',
          color: '#FF9800',
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
        };
    }
  };

  return (
    <Box>
      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              总退货订单
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                1,082
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                5.2%
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
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              退货金额
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                ¥245,320
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#F44336',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                7.8%
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
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              价值恢复率
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                87.3%
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                2.1%
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
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              平均处理时间
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                1.8天
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#4CAF50',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowDownwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                12%
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 最近退货 */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          mb: 3
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500, mb: 2 }}>
            最近退货
          </Typography>
          
          {/* 搜索和筛选 */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="product-category-label">商品类别</InputLabel>
                <Select
                  labelId="product-category-label"
                  value={productCategory}
                  label="商品类别"
                  onChange={handleProductCategoryChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="electronics">电子产品</MenuItem>
                  <MenuItem value="clothing">服装鞋包</MenuItem>
                  <MenuItem value="home">家居用品</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="return-reason-label">退货原因</InputLabel>
                <Select
                  labelId="return-reason-label"
                  value={returnReason}
                  label="退货原因"
                  onChange={handleReturnReasonChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="quality">质量问题</MenuItem>
                  <MenuItem value="function">功能不符</MenuItem>
                  <MenuItem value="damage">运输损坏</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">处理状态</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="处理状态"
                  onChange={handleStatusChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="pending">待处理</MenuItem>
                  <MenuItem value="processing">处理中</MenuItem>
                  <MenuItem value="completed">已完成</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-label">日期范围</InputLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  label="日期范围"
                  onChange={handleDateRangeChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="today">今天</MenuItem>
                  <MenuItem value="week">本周</MenuItem>
                  <MenuItem value="month">本月</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6} md={1}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleSearch}
                sx={{ 
                  height: '100%',
                  backgroundColor: '#1a73e8',
                  fontSize: '0.875rem'
                }}
              >
                搜索
              </Button>
            </Grid>
            
            <Grid item xs={6} md={1}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={handleBatchProcess}
                sx={{ 
                  height: '100%',
                  borderColor: '#1a73e8',
                  color: '#1a73e8',
                  fontSize: '0.875rem'
                }}
              >
                批量处理
              </Button>
            </Grid>
          </Grid>
          
          {/* 表格 */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>订单信息</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>退货原因</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>AI建议</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>状态</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>金额</TableCell>
                  <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockReturns.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    onClick={() => handleRowClick(row.id)}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 1.5
                          }}
                        >
                          图
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                            {row.product_name} {row.product_id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {row.order_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Chip 
                        label={row.return_reason} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem', 
                          bgcolor: row.return_reason === '功能不符合预期' ? '#FFEBEE' : 
                                  row.return_reason === '配对问题' ? '#FFF8E1' : '#E0F2F1',
                          color: row.return_reason === '功能不符合预期' ? '#E53935' : 
                                row.return_reason === '配对问题' ? '#FF8F00' : '#00897B',
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Chip 
                        label={`${row.ai_recommendation} (${Math.round(row.ai_confidence * 100)}%)`} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem', 
                          bgcolor: getAIRecommendationStyle(row.ai_recommendation).bg,
                          color: getAIRecommendationStyle(row.ai_recommendation).color,
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(row.status)} 
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem', 
                          bgcolor: getStatusColor(row.status).bg,
                          color: getStatusColor(row.status).color,
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                        ¥{row.original_price}
                      </Typography>
                      {row.resale_price > 0 && (
                        <Typography variant="body2" color="success.main" sx={{ fontSize: '0.75rem' }}>
                          估计回收: ¥{row.resale_price}
                        </Typography>
                      )}
                      {row.resale_price === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          估计回收: ¥0
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row.id);
                        }}
                        sx={{ 
                          fontSize: '0.75rem',
                          borderColor: '#1a73e8',
                          color: '#1a73e8',
                        }}
                      >
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* 分页 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              显示 1-4 / 127 个退货订单
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5, 
                  mr: 1,
                  borderColor: '#e0e0e0',
                  color: '#5f6368'
                }}
              >
                1
              </Button>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5, 
                  mr: 1,
                  color: '#5f6368'
                }}
              >
                2
              </Button>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5, 
                  mr: 1,
                  color: '#5f6368'
                }}
              >
                3
              </Button>
              <Button 
                variant="text" 
                size="small" 
                sx={{ 
                  minWidth: 'auto', 
                  p: 0.5,
                  color: '#5f6368'
                }}
              >
                →
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReturnsList; 