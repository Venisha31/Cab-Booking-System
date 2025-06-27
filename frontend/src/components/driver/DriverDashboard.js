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
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('rideRequests');
  const [activeRide, setActiveRide] = useState(null);
  const [allRides, setAllRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTab === 'rideRequests') {
      fetchActiveRide();
    } else if (selectedTab === 'myRides') {
      fetchAllRides();
    }
  }, [selectedTab]);

  const fetchActiveRide = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings/driver-active');
      setActiveRide(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch active ride');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRides = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings/driver-bookings');
      setAllRides(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`/api/bookings/${activeRide._id}/status`, { status });
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
              color: selectedTab === 'rideRequests' ? '#00c6ff' : '#fff',
              '&:hover': { color: '#fbc02d' },
            }}
            onClick={() => setSelectedTab('rideRequests')}
          >
            🚗 Ride Requests
          </Typography>

          <Typography
            sx={{
              mb: 2,
              cursor: 'pointer',
              color: selectedTab === 'myRides' ? '#00c6ff' : '#fff',
              '&:hover': { color: '#fbc02d' },
            }}
            onClick={() => setSelectedTab('myRides')}
          >
            📘 My Rides
          </Typography>

          <Typography
            sx={{
              mb: 2,
              cursor: 'pointer',
              color: selectedTab === 'profile' ? '#00c6ff' : '#fff',
              '&:hover': { color: '#fbc02d' },
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

            {selectedTab === 'myRides' && (
              <Paper elevation={3} sx={{
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                color: '#ccc',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fbc02d', mb: 2 }}>
                  📘 All Assigned Rides
                </Typography>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : allRides.length === 0 ? (
                  <Typography>No rides assigned yet.</Typography>
                ) : (
                  allRides.map((ride, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: '#1e1e1e' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff' }}>
                        {ride.pickup?.address || 'Unknown'} → {ride.dropoff?.address || 'Unknown'}
                      </Typography>
                      <Typography>Status: {ride.status}</Typography>
                      <Typography>Fare: ₹{ride.fare}</Typography>
                      <Typography>User: {ride.user?.name || 'N/A'} ({ride.user?.phoneNumber || 'N/A'})</Typography>
                      <Typography>Date: {new Date(ride.createdAt).toLocaleString()}</Typography>
                    </Paper>
                  ))
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
