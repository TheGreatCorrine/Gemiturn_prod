import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 临时登录功能（仅用于演示）
  const handleDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    // 模拟点击登录按钮
    setTimeout(() => {
      const form = document.getElementById('login-form') as HTMLFormElement;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={0} sx={{ p: 4, width: '100%', borderRadius: 2, boxShadow: '0 1px 3px 0 rgb(60 64 67 / 30%), 0 4px 8px 3px rgb(60 64 67 / 15%)' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 500, color: '#202124' }}>
              Gemiturn
            </Typography>
            <Typography component="h2" variant="body2" sx={{ color: '#5f6368', mt: 0.5 }}>
              AI-Driven Return Management
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8125rem' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" id="login-form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                py: 1, 
                fontSize: '0.875rem',
                backgroundColor: '#1a73e8',
                '&:hover': {
                  backgroundColor: '#0d47a1'
                }
              }}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
            
            <Divider sx={{ my: 2, color: '#5f6368', fontSize: '0.75rem' }}>或</Divider>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDemoLogin}
              sx={{ 
                py: 1, 
                fontSize: '0.875rem',
                borderColor: '#dadce0',
                color: '#1a73e8',
                '&:hover': {
                  borderColor: '#1a73e8',
                  backgroundColor: 'rgba(26, 115, 232, 0.04)'
                }
              }}
            >
              使用演示账号
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                演示账号: admin / admin123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 