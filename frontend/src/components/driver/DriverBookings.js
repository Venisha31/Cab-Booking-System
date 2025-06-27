import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';

const DriverBookings = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchDriverBookings = async () => {
      try {
        const res = await axios.get('https://cab-booking-system-csfj.onrender.com/api/bookings/driver-bookings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRides(res.data.data || []);
      } catch (error) {
        console.error('Error fetching driver bookings:', error);
      }
    };

    fetchDriverBookings();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>📋 All Assigned Bookings</Typography>
      <Grid container spacing={2}>
        {rides.length === 0 ? (
          <Typography>No bookings assigned yet.</Typography>
        ) : (
          rides.map((ride, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {ride.pickup?.address || 'Unknown'} → {ride.dropoff?.address || 'Unknown'}
                </Typography>
                <Typography>Status: {ride.status}</Typography>
                <Typography>Fare: ₹{ride.fare}</Typography>
                <Typography>User: {ride.user?.name} ({ride.user?.phoneNumber})</Typography>
                <Typography>Date: {new Date(ride.createdAt).toLocaleString()}</Typography>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default DriverBookings;
