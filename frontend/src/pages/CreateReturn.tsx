import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

// 定义退货原因分类
const RETURN_CATEGORIES = {
  reasons: [
    { value: 'quality_issues', label: '质量问题', desc: '产品损坏、功能故障、制造缺陷' },
    { value: 'size_mismatch', label: '尺寸不合适', desc: '太大/太小、尺寸不准确' },
    { value: 'appearance', label: '外观差异', desc: '颜色差异、款式与描述不符' },
    { value: 'performance', label: '性能不达标', desc: '功能不符合预期、性能低于广告宣传' },
    { value: 'wrong_item', label: '收到错误商品', desc: '完全不同的产品' },
    { value: 'logistics', label: '物流问题', desc: '运输过程中损坏、包装损坏' },
    { value: 'changed_mind', label: '客户改变主意', desc: '不再需要、找到替代品' },
    { value: 'missing_parts', label: '配件缺失', desc: '缺少组件' },
    { value: 'allergic', label: '过敏/不良反应', desc: '对材料过敏、使用后不适' },
    { value: 'late_delivery', label: '延迟交付', desc: '显著超出预期交付时间' }
  ],
  processing: [
    { value: 'direct_resale', label: '直接转售', desc: '全新未开封产品，可直接再次销售' },
    { value: 'discounted', label: '折价销售', desc: '轻微瑕疵但功能完好，检查后降价销售' },
    { value: 'return_supplier', label: '退回供应商', desc: '严重质量问题或批次缺陷，退回制造商' },
    { value: 'repair_resale', label: '维修后销售', desc: '小问题可修复的产品' },
    { value: 'parts_recycle', label: '零件回收', desc: '无法修复但有可用组件的产品' },
    { value: 'charity', label: '慈善捐赠', desc: '功能正常但不适合转售的物品' },
    { value: 'disposal', label: '环保处理', desc: '无法使用且不可回收的产品' },
    { value: 'cross_platform', label: '跨平台直接销售', desc: '完好商品可在我们的市场直接销售' },
    { value: 'bundle', label: '打包销售', desc: '将多个退货商品组合成套装销售' },
    { value: 'display', label: '转为样品/展示品', desc: '轻微外观问题可用作展示样品' }
  ]
};

const CreateReturn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    order_id: `ORD-${Date.now()}`, // 使用时间戳生成唯一订单ID
    product_id: '',
    product_name: '',
    product_category: '',
    return_reason: '',
    customer_description: '',
    original_price: '',
    images: [] as File[]
  });

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 获取token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('未找到认证令牌');
      }
      
      // 创建 FormData 对象
      const formDataObj = new FormData();
      formData.images.forEach((image) => {
        formDataObj.append('images', image);
      });
      formDataObj.append('description', formData.customer_description);
      
      // 使用API_URL常量而不是硬编码URL
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
      
      // 发送 AI 分析请求
      console.log('开始发送 AI 分析请求...');
      console.log('Token:', token);
      const analysisResponse = await fetch(`${API_URL}/gemini/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });
      
      console.log('AI 分析响应状态:', analysisResponse.status);
      let aiAnalysisResult = null;
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        console.log('AI分析结果:', analysisData);
        aiAnalysisResult = {
          category: analysisData.category || '未分类',
          reason: analysisData.reason || '分析失败',
          recommendation: analysisData.recommendation || '人工审核',
          confidence: analysisData.confidence || 0.0
        };
        setAiAnalysis(aiAnalysisResult);
      } else {
        const errorText = await analysisResponse.text();
        console.warn('AI分析失败:', {
          status: analysisResponse.status,
          statusText: analysisResponse.statusText,
          error: errorText
        });
        aiAnalysisResult = {
          category: '未分类',
          reason: '分析失败',
          recommendation: '人工审核',
          confidence: 0.0
        };
      }
      
      // 创建退货订单
      console.log('开始创建退货订单，AI分析结果:', aiAnalysisResult);
      
      const response = await fetch(`${API_URL}/returns/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          order_id: formData.order_id,
          product_id: formData.product_id,
          product_name: formData.product_name,
          product_category: formData.product_category,
          return_reason: formData.return_reason,
          customer_description: formData.customer_description,
          original_price: parseFloat(formData.original_price),
          ai_analysis: aiAnalysisResult
        })
      });
      
      console.log('退货订单响应状态:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`创建退货订单失败: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('创建退货订单成功:', result);
      
      setSuccess(true);
      
      // 3秒后跳转到详情页
      setTimeout(() => {
        navigate(`/returns/${result.id}`);
      }, 3000);
      
    } catch (err) {
      console.error('创建退货订单错误:', err);
      setError(err instanceof Error ? err.message : '创建退货订单时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          创建退货订单
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/returns')}>
          返回列表
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          退货订单创建成功！正在跳转到详情页...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* 基本信息 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="订单编号"
                    name="order_id"
                    value={formData.order_id}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="商品编号"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="商品名称"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="商品类别"
                    name="product_category"
                    value={formData.product_category}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="原始价格"
                    name="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* 退货信息 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                退货信息
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>退货原因</InputLabel>
                    <Select
                      name="return_reason"
                      value={formData.return_reason}
                      label="退货原因"
                      onChange={(e) => handleInputChange(e as any)}
                    >
                      {RETURN_CATEGORIES.reasons.map(reason => (
                        <MenuItem key={reason.value} value={reason.value}>
                          {reason.label} - {reason.desc}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={4}
                    label="详细描述"
                    name="customer_description"
                    value={formData.customer_description}
                    onChange={handleInputChange}
                    placeholder="请详细描述退货原因和产品问题..."
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* 图片上传 */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                上传图片
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    选择图片
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  支持 JPG、PNG 格式，最多可上传 5 张图片
                </Typography>

                {formData.images.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    {formData.images.map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={URL.createObjectURL(image)}
                        alt={`上传图片 ${index + 1}`}
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 1,
                          border: '1px solid #eee'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* AI 分析结果 */}
          {aiAnalysis && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI 分析结果
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        分类
                      </Typography>
                      <Typography variant="body1">
                        {aiAnalysis.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        原因
                      </Typography>
                      <Typography variant="body1">
                        {aiAnalysis.reason}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">
                        建议处理方式
                      </Typography>
                      <Typography variant="body1">
                        {aiAnalysis.recommendation}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* 提交按钮 */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/returns')}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? '提交中...' : '创建退货订单'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CreateReturn; 