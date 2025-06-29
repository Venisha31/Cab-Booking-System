// pages/UserSpendings.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { fetchMonthlySpendings } from '../../services/bookingService.js';

const UserSpendings = () => {
  const [spendings, setSpendings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSpendings = async () => {
      try {
        const data = await fetchMonthlySpendings();
        setSpendings(data);
      } catch (error) {
        console.error('Error fetching user spendings:', error);
      } finally {
        setLoading(false);
      }
    };
    getSpendings();
  }, []);

  return (
    <Box sx={{ p: 4, background: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#fbc02d', fontWeight: 'bold' }}>
        💸 Monthly Spendings
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: 2 }}>
          <Typography>Total Spendings: ₹{spendings.totalSpent}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default UserSpendings;
