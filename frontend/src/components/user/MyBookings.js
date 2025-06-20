import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await axios.get('/api/bookings/user-bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(res.data.data || []);
    };
    fetchBookings();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>My Bookings</Typography>
      {bookings.map((b, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2 }}>
          <Typography>{b.pickup?.address} → {b.dropoff?.address}</Typography>
          <Typography>Status: {b.status}</Typography>
          <Typography>Fare: ₹{b.fare}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default MyBookings;
