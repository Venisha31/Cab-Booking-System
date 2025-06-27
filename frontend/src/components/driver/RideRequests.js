import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  LocationOn,
  Timer,
  DirectionsCar
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/axios';
import io from 'socket.io-client';

const RideRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRide, setActiveRide] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchRideData();
    // Set up socket connection
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.on('new-booking', handleNewBooking);
    return () => socket.disconnect();
  }, []);

  const handleNewBooking = (booking) => {
    setRideRequests(prev => [...prev, booking]);
  };

  const fetchRideData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch active ride if any
      const activeResponse = await api.get('https://cab-booking-system-csfj.onrender.com/api/bookings/driver-active');
      setActiveRide(activeResponse.data.data);

      // Fetch pending requests
      const requestsResponse = await api.get('https://cab-booking-system-csfj.onrender.com/api/bookings/driver-requests');
      setRideRequests(requestsResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching ride data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setLoading(true);
      const response = await api.put(`https://cab-booking-system-csfj.onrender.com/api/bookings/${requestId}/accept`);
      setActiveRide(response.data.data);
      setRideRequests(prev => prev.filter(req => req._id !== requestId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error accepting ride');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoading(true);
      await api.put(`https://cab-booking-system-csfj.onrender.com/api/bookings/${requestId}/reject`);
      setRideRequests(prev => prev.filter(req => req._id !== requestId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error rejecting ride');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      const response = await api.put(`https://cab-booking-system-csfj.onrender.com/api/bookings/${activeRide._id}/status`, {
        status: selectedStatus
      });
      
      if (selectedStatus === 'completed' || selectedStatus === 'cancelled') {
        setActiveRide(null);
      } else {
        setActiveRide(response.data.data);
      }
      
      setStatusDialogOpen(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ride Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Active Ride Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Active Ride
        </Typography>
        {activeRide ? (
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                Pickup: {activeRide.pickup.address}
              </Typography>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn color="error" sx={{ mr: 1 }} />
                Dropoff: {activeRide.dropoff.address}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              Fare: ₹{activeRide.fare}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Status: {activeRide.status.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setStatusDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Update Status
            </Button>
          </Paper>
        ) : (
          <Typography color="textSecondary">
            No active rides at the moment.
          </Typography>
        )}
      </Box>

      {/* Pending Requests Section */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Pending Requests
        </Typography>
        {rideRequests.length > 0 ? (
          <Grid container spacing={2}>
            {rideRequests.map((request) => (
              <Grid item xs={12} md={6} key={request._id}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      Pickup: {request.pickup.address}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn color="error" sx={{ mr: 1 }} />
                      Dropoff: {request.dropoff.address}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" color="primary" gutterBottom>
                    Fare: ₹{request.fare}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AcceptIcon />}
                      onClick={() => handleAccept(request._id)}
                      fullWidth
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleReject(request._id)}
                      fullWidth
                    >
                      Reject
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="textSecondary">
            No pending ride requests.
          </Typography>
        )}
      </Box>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Ride Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="on_the_way">On the Way</MenuItem>
              <MenuItem value="picked_up">Picked Up</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RideRequests; 