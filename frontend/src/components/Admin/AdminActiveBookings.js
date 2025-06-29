import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, CircularProgress, Box
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const AdminActiveBookings = () => {
  const { token } = useAuth();
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_URL}/api/admin/bookings/active`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setActiveBookings(res.data);
      })
      .catch((err) => {
        console.error('Error fetching active bookings:', err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ p: 2 }}>
        Active Bookings
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell>Pickup</TableCell>
            <TableCell>Dropoff</TableCell>
            <TableCell>Fare (₹)</TableCell>
            <TableCell>Booked On</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activeBookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell>{booking.user?.name} ({booking.user?.email})</TableCell>
              <TableCell>{booking.driver?.name} ({booking.driver?.email})</TableCell>
              <TableCell>{booking.pickup?.address}</TableCell>
              <TableCell>{booking.dropoff?.address}</TableCell>
              <TableCell>{booking.fare}</TableCell>
              <TableCell>
                {booking.createdAt
                  ? new Date(booking.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminActiveBookings;
