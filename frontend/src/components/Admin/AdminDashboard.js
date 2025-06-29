import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { fetchStats } from '../../services/adminApi';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, onClick }) => (
  <Paper
    sx={{
      p: 2,
      bgcolor: '#1f1f1f',
      color: '#fff',
      borderRadius: 2,
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': {
        boxShadow: onClick ? 6 : undefined,
        backgroundColor: onClick ? '#292929' : undefined,
      }
    }}
    onClick={onClick}
    style={{ pointerEvents: 'auto' }}
  >
    <Typography variant="h6">{title}</Typography>
    <Typography variant="h4" fontWeight="bold">{value}</Typography>
  </Paper>
);

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Hook to navigate

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchStats(token);
         console.log("📦 Dashboard Stats:", res.data);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadStats();
  }, [token]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (!stats) return <Typography color="error">Error loading dashboard</Typography>;

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3} fontWeight="bold">Admin Dashboard Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Users" value={stats.totalUsers} onClick={() => navigate('/admin/users')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Drivers" value={stats.totalDrivers} onClick={() => navigate('/admin/drivers')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Bookings" value={stats.totalBookings} onClick={() => navigate('/admin/bookings')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Cabs"
            value={stats.activeCabs}
            onClick={() => navigate('/admin/bookings?status=driver_assigned')}
          />

        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Completed Bookings"
            value={stats.completedBookings}
            onClick={() => navigate('/admin/bookings?status=completed')} // ✅ Navigate with query
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            onClick={() => navigate('/admin/bookings?status=pending')} // ✅ Navigate with query
          />
        </Grid>

      </Grid>
    </Box>
  );
};

export default AdminDashboard;
