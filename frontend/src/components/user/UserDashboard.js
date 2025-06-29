import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

// Keep all your existing imports unchanged

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [pastRides, setPastRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);

    const fetchPastRides = async () => {
      try {
        const response = await axios.get('https://cab-booking-system-csfj.onrender.com/api/bookings/user-bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPastRides(response.data.data || []);
      } catch (error) {
        console.error('❌ Error fetching past rides:', error);
      }
    };

    const fetchActiveRide = async () => {
      try {
        const response = await axios.get('https://cab-booking-system-csfj.onrender.com/api/bookings/user-active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setActiveRide(response.data.data || null);
      } catch (error) {
        console.error('❌ Error fetching active ride:', error);
      }
    };

    fetchPastRides();
    fetchActiveRide();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: '#121212',
        minHeight: '100vh',
        color: '#e0e0e0',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Grid container>
        {/* Sidebar */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            backgroundColor: '#1e1e1e',
            minHeight: { xs: 'auto', md: '100vh' },
            p: 2,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fbc02d' }}>
              🚖 BookRide
            </Typography>
          </Box>
          {[
            { label: '➕ BOOK RIDE', path: '/user/book-ride' },
            { label: '📘 MY BOOKINGS', path: '/user/my-bookings' },
            { label: '🔁 PAST RIDES', path: '/user/past-rides' },
            { label: '🔁 My Profile', path: '/user/Userprofile' },
          ].map((item) => (
            <Typography
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 1,
                cursor: 'pointer',
                '&:hover': { color: '#fbc02d' },
                color: '#fff',
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fbc02d', mb: 1 }}>
              Welcome, {user?.name?.split(' ')[0] || 'User'}!
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 3, color: '#bbb' }}>
              From doorstep pickup to destination drop — your smoothest ride experience starts here.
            </Typography>

            <Grid container spacing={3}>
              {/* Book Ride Card */}
              <Grid item xs={12} sm={6}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <Paper elevation={3} sx={cardStyles}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
                      Book a New Ride
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                      Choose your destination and cab type, and get started.
                    </Typography>
                    <Button onClick={() => navigate('/user/book-ride')} sx={buttonStyles}>
                      Book Now
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>

              {/* Active Ride Card */}
              <Grid item xs={12} sm={6}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <Paper elevation={3} sx={cardStyles}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#fff' }}>
                      Your Active Booking
                    </Typography>
                    {activeRide ? (
                      <>
                        <Typography sx={{ color: '#ccc' }}>
                          {activeRide?.pickup?.address || 'Unknown'} → {activeRide?.dropoff?.address || 'Unknown'}
                        </Typography>
                        <Typography sx={{ color: '#ccc' }}>
                          Cab: {activeRide?.cabType} · ₹{activeRide?.fare}
                        </Typography>
                        <Typography sx={{ color: '#888' }}>Status: {activeRide?.status}</Typography>
                      </>
                    ) : (
                      <Typography sx={{ color: '#aaa' }}>No active ride found.</Typography>
                    )}
                  </Paper>
                </motion.div>
              </Grid>

              {/* Past Rides */}
              <Grid item xs={12}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                  <Paper elevation={3} sx={cardStyles}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>
                      Past Rides
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      {Array.isArray(pastRides) && pastRides.length > 0 ? (
                        pastRides.map((ride, index) => (
                          <Paper key={index} sx={rideCardStyles}>
                            <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>
                              {ride?.pickup?.address || 'Unknown'} → {ride?.dropoff?.address || 'Unknown'}
                            </Typography>
                            <Typography sx={{ color: '#ccc' }}>Fare: ₹{ride?.fare ?? 'N/A'}</Typography>
                            <Typography sx={{ color: '#888' }}>
                              {ride?.completedAt || ride?.createdAt
                                ? new Date(ride.completedAt || ride.createdAt).toLocaleDateString()
                                : 'Date not available'}
                            </Typography>
                          </Paper>
                        ))
                      ) : (
                        <Typography sx={{ color: '#aaa' }}>No past rides found.</Typography>
                      )}
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// 💡 Reusable styles
const cardStyles = {
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  p: 3,
  height: '100%',
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'scale(1.02)' },
  color: '#ccc',
};

const rideCardStyles = {
  p: 2,
  flex: '1 1 300px',
  backgroundColor: '#2c2c2c',
};

const buttonStyles = {
  background: '#00c6ff',
  color: '#000',
  fontWeight: 'bold',
  boxShadow: '0 0 10px #00c6ff',
  '&:hover': { background: '#00b0e0' },
};

export default UserDashboard;

