import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Dashboard from 'pages/Dashboard';
import Login from 'pages/Login';
import ReturnsList from 'pages/ReturnsList';
import ReturnDetail from 'pages/ReturnDetail';
import Analytics from 'pages/Analytics';
import NotFound from 'pages/NotFound';

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
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          padding: '6px 16px',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          borderRadius: 8,
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Using Layout component directly, no need for ProtectedRoute */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="returns" element={<ReturnsList />} />
          <Route path="returns/:id" element={<ReturnDetail />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 