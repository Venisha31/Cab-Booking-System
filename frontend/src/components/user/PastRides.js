import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const PastRides = () => {
  const [completedRides, setCompletedRides] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await axios.get('https://cab-booking-system-csfj.onrender.com/api/bookings/user-bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const filtered = res.data.data?.filter(b => b.status === 'completed');
      setCompletedRides(filtered || []);
    };
    fetchBookings();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Past Rides</Typography>
      {completedRides.map((b, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2 }}>
          <Typography>{b.pickup?.address} → {b.dropoff?.address}</Typography>
          <Typography>Date: {new Date(b.completedAt || b.createdAt).toLocaleString()}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default PastRides;
