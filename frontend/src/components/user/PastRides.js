import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const PastRides = () => {
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/user-bookings`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const filtered = res.data.data?.filter(b => b.status === 'completed');
        setCompletedRides(filtered || []);
      } catch (error) {
        console.error('❌ Failed to fetch bookings:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
        <Typography variant="body2" mt={2}>Loading past rides...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Past Rides</Typography>
      {completedRides.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No past rides found.</Typography>
      ) : (
        completedRides.map((b, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 2 }}>
            <Typography>
              {b.pickup?.address || 'Unknown Pickup'} → {b.dropoff?.address || 'Unknown Drop'}
            </Typography>
            <Typography color="text.secondary">
              Date: {new Date(b.completedAt || b.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default PastRides;
