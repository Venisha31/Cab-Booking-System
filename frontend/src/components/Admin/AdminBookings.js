import React, { useEffect, useState } from 'react';
import { fetchAllBookings } from '../../services/adminService';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, CircularProgress, Box
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom'; // ✅ For query param support

const AdminBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookingStatus = queryParams.get('status'); // ✅ read ?status=completed

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetchAllBookings(token)
      .then((data) => {
        console.log("Fetched bookings:", data);
        const filtered = bookingStatus
          ? data.filter(b => b.status === bookingStatus)
          : data;
        setBookings(filtered);
      })
      .catch((err) => {
        console.error('Booking fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, [token, bookingStatus]);

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
        {bookingStatus ? `${bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)} Bookings` : 'All Bookings'}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Driver</TableCell>
            <TableCell>Pickup</TableCell>
            <TableCell>Dropoff</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Fare (₹)</TableCell>
            <TableCell>Booked On</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell>{booking.user?.name} ({booking.user?.email})</TableCell>
              <TableCell>
                {booking.driver ? `${booking.driver.name} (${booking.driver.email})` : 'Not Assigned'}
              </TableCell>
              <TableCell>{booking.pickup?.address}</TableCell>
              <TableCell>{booking.dropoff?.address}</TableCell>
              <TableCell>{booking.status}</TableCell>
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

export default AdminBookings;
