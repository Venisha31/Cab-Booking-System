// pages/DriverEarnings.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchMonthlyEarnings } from '../../services/bookingService';

const DriverEarnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getEarnings = async () => {
      try {
        const data = await fetchMonthlyEarnings();
        if (!data || typeof data.totalEarnings !== 'number') {
          throw new Error('Invalid earnings data');
        }
        setEarnings(data);
      } catch (err) {
        console.error('Error fetching driver earnings:', err);
        setError('Could not fetch earnings. Please try again later.');
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
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : earnings ? (
        <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 2 }}>
          <Typography>Total Earnings: ₹{earnings.totalEarnings}</Typography>
          <Typography>Total Rides: {earnings.totalRides}</Typography>
          <Typography>
            Average Fare: ₹{earnings.averageFare?.toFixed(2) || '0.00'}
          </Typography>
        </Paper>
      ) : (
        <Typography>No earnings data available</Typography>
      )}
    </Box>
  );
};

export default DriverEarnings;
