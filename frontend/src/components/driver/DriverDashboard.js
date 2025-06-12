import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/axios';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveRide();
  }, []);

  const fetchActiveRide = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings/driver-active');
      setActiveRide(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching active ride');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`/api/bookings/${activeRide._id}/status`, {
        status
      });
      fetchActiveRide();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating ride status');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Driver Profile
            </Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Phone: {user.phoneNumber}</Typography>
            <Typography>Role: {user.role}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Ride
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : activeRide ? (
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      <LocationOn /> Pickup: {activeRide.pickup.address}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      <LocationOn /> Dropoff: {activeRide.dropoff.address}
                    </Typography>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Fare: ₹{activeRide.fare}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Status: {activeRide.status.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {activeRide.status === 'driver_assigned' && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleStatusUpdate('on_the_way')}
                      >
                        Start Journey
                      </Button>
                    )}
                    {activeRide.status === 'on_the_way' && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleStatusUpdate('picked_up')}
                      >
                        Picked Up
                      </Button>
                    )}
                    {activeRide.status === 'picked_up' && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleStatusUpdate('completed')}
                      >
                        Complete Ride
                      </Button>
                    )}
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleStatusUpdate('cancelled')}
                    >
                      Cancel Ride
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Typography color="textSecondary">
                No active rides at the moment.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverDashboard; 