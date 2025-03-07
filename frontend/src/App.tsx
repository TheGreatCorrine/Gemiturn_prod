import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';

// Pages
import Dashboard from 'pages/Dashboard';
import Login from 'pages/Login';
import Signup from 'pages/Signup';
import ReturnsList from 'pages/ReturnsList';
import ReturnDetail from 'pages/ReturnDetail';
import Analytics from 'pages/Analytics';
import NotFound from 'pages/NotFound';
import ApiDocumentation from 'pages/ApiDocumentation';

// Components
import Layout from 'components/Layout';

// Context
import { useAuth } from 'context/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8', // Google Cloud blue
      light: '#4285f4',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#34a853', // Google Cloud green
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#ea4335', // Google Cloud red
    },
    warning: {
      main: '#fbbc04', // Google Cloud yellow
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 400,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 400,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          boxShadow: 'none',
          padding: '6px 16px',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 1px 2px 0 rgba(60,64,67,0.06)',
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

// Temporarily commented out ProtectedRoute component
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isAuthenticated } = useAuth();
//   
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
//   
//   return <>{children}</>;
// };

// Development JWT troubleshooting tools
const JwtDebugTools = () => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const clearTokenAndReload = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      zIndex: 9999,
      padding: '10px',
      background: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <div style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>
        DEV TOOLS
      </div>
      <button 
        onClick={clearTokenAndReload}
        style={{
          padding: '5px 10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Clear Token & Reload
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Using Layout component directly, no need for ProtectedRoute */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="returns" element={<ReturnsList />} />
            <Route path="returns/:id" element={<ReturnDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="api-docs" element={<ApiDocumentation />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
      <JwtDebugTools />
    </AuthProvider>
  );
}

export default App; 