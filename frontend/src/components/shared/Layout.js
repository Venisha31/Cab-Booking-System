import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { Outlet } from 'react-router-dom'; // ✅ Import this

const Layout = () => { // ✅ Remove children prop, use <Outlet />
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff' }}>
      {/* Top Bar */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#000',
          borderBottom: '2px solid #feb800',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="#feb800">
          {user.role === 'admin'
            ? 'Admin Dashboard'
            : user.role === 'driver'
              ? 'Driver Dashboard'
              : 'User Dashboard'}
        </Typography>
        <Box>
          <Button
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{
              color: '#000',
              bgcolor: '#feb800',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#e0a800' },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, bgcolor: '#121212', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet /> {/* ✅ This renders nested routes like AdminBookings */}
      </Box>
    </Box>
  );
};

export default Layout;
