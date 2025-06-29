import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const DriverBookings = () => {
  console.log("✅ DriverBookings TABLE VERSION rendering");

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverBookings = async () => {
      try {
        const res = await axios.get('https://cab-booking-system-csfj.onrender.com/api/bookings/driver-bookings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setRides(res.data.data || []);
      } catch (error) {
        console.error('❌ Error fetching driver bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverBookings();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        📋 All Assigned Bookings
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : rides.length === 0 ? (
        <Typography>No bookings assigned yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#fbc02d' }}>Pickup → Dropoff</TableCell>
                <TableCell sx={{ color: '#fbc02d' }}>Status</TableCell>
                <TableCell sx={{ color: '#fbc02d' }}>Fare (₹)</TableCell>
                <TableCell sx={{ color: '#fbc02d' }}>User</TableCell>
                <TableCell sx={{ color: '#fbc02d' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rides.map((ride, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ color: '#fff' }}>
                    {ride.pickup?.address || 'N/A'} → {ride.dropoff?.address || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{ride.status}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{ride.fare}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>
                    {ride.user?.name} ({ride.user?.phoneNumber})
                  </TableCell>
                  <TableCell sx={{ color: '#ccc' }}>
                    {new Date(ride.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DriverBookings;
