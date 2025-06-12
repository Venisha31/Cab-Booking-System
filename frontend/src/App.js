import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import HeroSection from "./components/user/HeroSection.js";
// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// User Components
import UserDashboard from './components/user/UserDashboard';
import BookRide from './components/user/BookRide';

// Driver Components
import DriverDashboard from './components/driver/DriverDashboard';
import RideRequests from './components/driver/RideRequests';

// Shared Components
import PrivateRoute from './components/shared/PrivateRoute';
import Layout from './components/shared/Layout';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Routes */}
          <Route
            path="/user/*"
            element={
              <PrivateRoute role="user">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="book-ride" element={<BookRide />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Protected Driver Routes */}
          <Route
            path="/driver/*"
            element={
              <PrivateRoute role="driver">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<DriverDashboard />} />
                    <Route path="ride-requests" element={<RideRequests />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 