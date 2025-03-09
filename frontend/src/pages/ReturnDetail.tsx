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
  image_urls?: string[];
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
          setError('Authentication token not found, please login first');
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
          throw new Error(`Failed to get return order details: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Return order details received:', data);
        
        setReturnItem(data);
        setStatus(data.status);
        setResalePrice(data.resale_price);
      } catch (err: any) {
        console.error('Error getting return order details:', err);
        setError(err.message || 'Failed to get return order details');
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
        setError('Authentication token not found, please login first');
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
        throw new Error(`Failed to update return order: ${response.status} ${response.statusText}`);
      }
      
      const updatedData = await response.json();
      setReturnItem(updatedData);
      setSaveSuccess(true);
      
      // 3秒后隐藏成功提示
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating return order:', err);
      setError(err.message || 'Failed to update return order');
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
          Back to List
        </Button>
      </Box>
    );
  }

  if (!returnItem) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Return order not found</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/returns')}
          sx={{ mt: 2 }}
        >
          Back to List
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Return Order Details #{id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/returns')}>
          Back to List
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Update Successful
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body1">
                  {returnItem.order_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Product ID
                </Typography>
                <Typography variant="body1">
                  {returnItem.product_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Product Name
                </Typography>
                <Typography variant="body1">
                  {returnItem.product_name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Product Category
                </Typography>
                <Typography variant="body1">
                  {returnItem.product_category}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Original Price
                </Typography>
                <Typography variant="body1">
                  ¥{returnItem.original_price.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={getStatusText(returnItem.status)} 
                  color={getStatusColor(returnItem.status) as any}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(returnItem.created_at)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">
                  {formatDate(returnItem.updated_at)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Product Images */}
        {returnItem.image_urls && returnItem.image_urls.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {returnItem.image_urls.map((url, index) => (
                  <Box 
                    key={index}
                    component="img"
                    src={url}
                    alt={`Product image ${index + 1}`}
                    sx={{ 
                      width: 200, 
                      height: 200, 
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #eee'
                    }}
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Return Reason
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer Provided Reason
            </Typography>
            <Typography variant="body1" paragraph>
              {returnItem.return_reason}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Customer Description
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
              title="AI Analysis Results" 
              subheader={returnItem.ai_analysis ? 
                `Confidence: ${(returnItem.ai_analysis.confidence * 100).toFixed(0)}%` : 
                'No AI Analysis Results'}
            />
            <CardContent>
              {returnItem.ai_analysis ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {returnItem.ai_analysis.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body1">
                      {returnItem.ai_analysis.reason}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Recommendation
                    </Typography>
                    <Chip 
                      label={returnItem.ai_analysis.recommendation}
                      color="primary"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {returnItem.ai_analysis?.confidence ? 
                      `Confidence: ${(returnItem.ai_analysis.confidence * 100).toFixed(0)}%` :
                      ''}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  This return order has no AI analysis results
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