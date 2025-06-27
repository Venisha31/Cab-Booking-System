import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ FIXED: defined navigate
  const [selectedTab, setSelectedTab] = useState('rideRequests');
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTab === 'rideRequests') {
      fetchActiveRide();
    }
  }, [selectedTab]);

  const fetchActiveRide = async () => {
    try {
      setLoading(true);
      const res = await api.get('https://cab-booking-system-csfj.onrender.com/api/bookings/driver-active');
      setActiveRide(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch active ride');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`https://cab-booking-system-csfj.onrender.com/api/bookings/${activeRide._id}/status`, { status });
      fetchActiveRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating ride status');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Poppins, sans-serif' }}>
      <Grid container>
        {/* Sidebar */}
        <Grid item xs={12} md={3} sx={{ backgroundColor: '#1e1e1e', minHeight: '100vh', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fbc02d', mb: 3 }}>🧑‍✈️ Driver Panel</Typography>

          <Typography
            sx={{
              mb: 2,
              cursor: 'pointer',
              color: window.location.pathname === '/driver/ride-requests' ? '#00c6ff' : '#fff',
              '&:hover': { color: '#00c6ff' },
            }}
            onClick={() => navigate('/driver/ride-requests')}
          >
            🚗 Ride Requests
          </Typography>

          <Typography
            sx={{
              mb: 2,
              cursor: 'pointer',
              color: selectedTab === 'profile' ? '#00c6ff' : '#fff',
              '&:hover': { color: '#00c6ff' },
            }}
            onClick={() => setSelectedTab('profile')}
          >
            👤 Profile
          </Typography>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fbc02d', mb: 3 }}>
  Welcome, {user?.name || 'Driver'} 👋
</Typography>

            {selectedTab === 'rideRequests' && (
              <Paper elevation={3} sx={{
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                color: '#ccc',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fbc02d', mb: 2 }}>
                  🚘 Active Ride
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : activeRide ? (
                  <>
                    <Typography>Pickup: {activeRide.pickup.address}</Typography>
                    <Typography>Dropoff: {activeRide.dropoff.address}</Typography>
                    <Typography>Fare: ₹{activeRide.fare}</Typography>
                    <Typography>Status: {activeRide.status}</Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {activeRide.status === 'driver_assigned' && (
                        <Button variant="contained" onClick={() => handleStatusUpdate('on_the_way')}>
                          Start Journey
                        </Button>
                      )}
                      {activeRide.status === 'on_the_way' && (
                        <Button variant="contained" onClick={() => handleStatusUpdate('picked_up')}>
                          Picked Up
                        </Button>
                      )}
                      {activeRide.status === 'picked_up' && (
                        <Button variant="contained" onClick={() => handleStatusUpdate('completed')}>
                          Complete Ride
                        </Button>
                      )}
                      <Button variant="outlined" color="error" onClick={() => handleStatusUpdate('cancelled')}>
                        Cancel Ride
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Typography sx={{ color: '#aaa' }}>No active ride at the moment.</Typography>
                )}
              </Paper>
            )}

            {selectedTab === 'profile' && (
              <Paper elevation={3} sx={{
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                color: '#ccc',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fbc02d', mb: 2 }}>
                  👤 Profile Details
                </Typography>
                <Typography>Name: {user?.name}</Typography>
                <Typography>Email: {user?.email}</Typography>
                <Typography>Phone: {user?.phoneNumber}</Typography>
                <Typography>Role: {user?.role}</Typography>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverDashboard;
