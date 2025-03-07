import React, { useState, useEffect } from 'react';
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
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { returnsAPI, analyticsAPI } from '../services/api';
import axios from 'axios';

const ReturnsList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productCategory, setProductCategory] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_count: 0,
    pending_count: 0,
    processing_count: 0,
    completed_count: 0,
    avg_processing_time: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // 检查是否有token
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage:', token.substring(0, 20) + '...');
    } else {
      console.error('No token found in localStorage!');
      setError('未找到认证令牌，请先登录');
      return;
    }
    
    fetchReturns();
    fetchStats();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    setError('');
    
    // Add debug information
    console.log('Fetching returns with filters:', { productCategory, returnReason, status, dateRange });
    
    try {
      // Re-verify auth state before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication token missing. Please login again.');
        setLoading(false);
        return;
      }
      
      // Check token format
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('Invalid token format:', token);
        setError('Invalid authentication token format. Please login again.');
        setLoading(false);
        return;
      }
      
      // Always explicitly set the Authorization header before each request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Request with Authorization header:', axios.defaults.headers.common['Authorization']);
      
      // Build the query parameters
      const params = {
        page: page,
        limit: rowsPerPage,
        status: status,
        category: productCategory,
        reason: returnReason,
        start_date: dateRange ? new Date(dateRange).toISOString().split('T')[0] : undefined,
        end_date: dateRange ? new Date(dateRange).toISOString().split('T')[0] : undefined,
        search: ''
      };
      
      console.log('API params:', params);
      
      // Make the API call with a timeout
      const response = await returnsAPI.getReturns(params);
      console.log('Returns API response:', response);
      
      // Process the response data
      if (Array.isArray(response.data)) {
        setReturns(response.data);
        setStats({
          total_count: response.data.length,
          pending_count: response.data.filter((r: any) => r.status === 'pending').length,
          processing_count: response.data.filter((r: any) => r.status === 'processing').length,
          completed_count: response.data.filter((r: any) => r.status === 'completed').length,
          avg_processing_time: 0 // Assuming avg_processing_time is not provided in the response
        });
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.items)) {
          setReturns(response.data.items);
          setStats({
            total_count: response.data.total || response.data.items.length,
            pending_count: response.data.items.filter((r: any) => r.status === 'pending').length,
            processing_count: response.data.items.filter((r: any) => r.status === 'processing').length,
            completed_count: response.data.items.filter((r: any) => r.status === 'completed').length,
            avg_processing_time: 0 // Assuming avg_processing_time is not provided in the response
          });
        } else {
          console.error('Unexpected response format:', response.data);
          setError('返回数据格式不正确');
        }
      } else {
        console.error('Unexpected response format:', response.data);
        setError('返回数据格式不正确');
      }
    } catch (err: any) {
      console.error('Error fetching returns:', err);
      
      // 详细记录错误信息
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        setError(`加载退货数据失败: ${err.response.data.message || err.response.data.msg || err.response.statusText || err.message}`);
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError(`加载退货数据失败: 服务器未响应`);
      } else {
        console.error('Error message:', err.message);
        setError(`加载退货数据失败: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats data...');
      const response = await analyticsAPI.getSummary();
      console.log('Stats API Response:', response);
      
      if (response.data) {
        setStats(response.data);
      } else {
        console.error('Unexpected stats API response format:', response);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      
      // 显示更详细的错误信息
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status:', err.response.status);
      }
    }
  };

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
    console.log('Search conditions:', { productCategory, returnReason, status, dateRange });
  };
  
  const handleBatchProcess = () => {
    console.log('Batch processing');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: '#FEF7E0',
          color: '#F29D12',
          text: 'Pending'
        };
      case 'processing':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
          text: 'Processing'
        };
      case 'completed':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
          text: 'Completed'
        };
      default:
        return {
          bg: '#F5F5F5',
          color: '#757575',
          text: 'Unknown'
        };
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
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  const handleRowClick = (id: number) => {
    navigate(`/returns/${id}`);
  };
  
  const getAIRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'Resell':
        return {
          bg: '#E8F5E9',
          color: '#4CAF50',
        };
      case 'Repair and sell':
        return {
          bg: '#E3F2FD',
          color: '#2196F3',
        };
      case 'Return to manufacturer':
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
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Total Return Orders
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                {stats.total_count}
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
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Pending Returns
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                {stats.pending_count}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#F29D12',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                8.1%
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
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Processing Returns
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                {stats.processing_count}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  ml: 1, 
                  mb: 0.5, 
                  color: '#2196F3',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ArrowDownwardIcon sx={{ fontSize: '0.875rem', mr: 0.25 }} />
                3.2%
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
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              height: '100%'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
              Average Processing Time
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" sx={{ fontWeight: 400, fontSize: '1.75rem' }}>
                {stats.avg_processing_time.toFixed(1)} days
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
      
      {/* Recent Returns */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 3
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="product-category-label">Product Category</InputLabel>
                <Select
                  labelId="product-category-label"
                  value={productCategory}
                  label="Product Category"
                  onChange={handleProductCategoryChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing & Accessories</MenuItem>
                  <MenuItem value="home">Home Goods</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="return-reason-label">Return Reason</InputLabel>
                <Select
                  labelId="return-reason-label"
                  value={returnReason}
                  label="Return Reason"
                  onChange={handleReturnReasonChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="quality">Quality Issues</MenuItem>
                  <MenuItem value="function">Functionality Issues</MenuItem>
                  <MenuItem value="damage">Shipping Damage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={handleStatusChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-label">Date Range</InputLabel>
                <Select
                  labelId="date-range-label"
                  value={dateRange}
                  label="Date Range"
                  onChange={handleDateRangeChange}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
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
                Search
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
                Batch Process
              </Button>
            </Grid>
          </Grid>
          
          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
              {error}
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Order Info</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Return Reason</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>AI Recommendation</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returns.length > 0 ? (
                    returns.map((row) => (
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
                              Img
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
                          {row.return_reason}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.ai_recommendation || 'Not analyzed'}
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem',
                              bgcolor: row.ai_recommendation ? getAIRecommendationStyle(row.ai_recommendation).bg : '#f5f5f5',
                              color: row.ai_recommendation ? getAIRecommendationStyle(row.ai_recommendation).color : '#757575',
                            }}
                          />
                          {row.ai_confidence && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                              Confidence: {(row.ai_confidence * 100).toFixed(0)}%
                            </Typography>
                          )}
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
                            ${row.original_price?.toFixed(2) || '0.00'}
                          </Typography>
                          {row.resale_price > 0 && (
                            <Typography variant="body2" color="success.main" sx={{ fontSize: '0.75rem' }}>
                              Resale: ${row.resale_price.toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="text" 
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem',
                              color: '#1a73e8',
                              minWidth: 'auto'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row.id);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                        No return items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Showing {returns.length > 0 ? `1-${returns.length}` : '0'} / {stats.total_count} return orders
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