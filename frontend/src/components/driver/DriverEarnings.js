// pages/DriverEarnings.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchMonthlyEarnings } from '../services/bookingService';

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEarnings = async () => {
      try {
        const data = await fetchMonthlyEarnings();
        setEarnings(data);
      } catch (error) {
        console.error('Error fetching driver earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    getEarnings();
  }, []);

  return (
    <Box sx={{ p: 4, background: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#fbc02d', fontWeight: 'bold' }}>
        🧾 Monthly Earnings
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 2 }}>
          <Typography>Total Earnings: ₹{earnings.totalEarnings}</Typography>
          <Typography>Total Rides: {earnings.totalRides}</Typography>
          <Typography>Average Fare: ₹{earnings.averageFare.toFixed(2)}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DriverEarnings;
