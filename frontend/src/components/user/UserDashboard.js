import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  AccessTime,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentRides();
  }, []);

  const fetchRecentRides = async () => {
    try {
    setLoading(true);
    const token = localStorage.getItem('token'); // or however you're storing the token

    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/user-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setRecentRides(response.data.data);
  } catch (err) {
      setError('Failed to fetch recent rides');
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'cancelled':
        return 'error.main';
      case 'in_progress':
        return 'info.main';
      case 'driver_assigned':
      case 'on_the_way':
      case 'picked_up':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Profile
            </Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Phone: {user.phoneNumber}</Typography>
            <Typography>Role: {user.role}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Rides
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : recentRides.length > 0 ? (
              <List>
                {recentRides.map((ride, index) => (
                  <React.Fragment key={ride._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          <DirectionsCar />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {ride.cabType.charAt(0).toUpperCase() + ride.cabType.slice(1)} Ride
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ color: getStatusColor(ride.status) }}
                            >
                              {formatStatus(ride.status)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                              >
                                <LocationOn fontSize="small" color="action" />
                                From: {ride.pickup.address}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                              >
                                <LocationOn fontSize="small" color="action" />
                                To: {ride.dropoff.address}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <AccessTime fontSize="small" color="action" />
                                  {formatDate(ride.createdAt)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                  <AttachMoney fontSize="small" color="action" />
                                  ₹{ride.fare}
                                </Typography>
                              </Box>
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < recentRides.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">
                No recent rides found.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard; 