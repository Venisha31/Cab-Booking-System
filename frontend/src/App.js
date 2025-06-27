import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import HeroSection from "./components/user/HeroSection.js";

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// User Components
import UserDashboard from './components/user/UserDashboard';
import BookRide from './components/user/BookRide';
import MyBookings from './components/user/MyBookings';
import PastRides from './components/user/PastRides';
import UserProfile from './components/user/UserProfile';

// Driver Components
import DriverDashboard from './components/driver/DriverDashboard';
import RideRequests from './components/driver/RideRequests';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminBookings from './components/Admin/AdminBookings';
import AdminUsers from './components/Admin/AdminUsers';
import AdminDrivers from './components/Admin/AdminDrivers';

// Shared Components
import PrivateRoute from './components/shared/PrivateRoute';
import Layout from './components/shared/Layout';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Protected Routes */}
          <Route path="/user" element={<PrivateRoute role="user"><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="book-ride" element={<BookRide />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="past-rides" element={<PastRides />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>


          {/* Driver Protected Routes */}
          <Route path="/driver" element={<PrivateRoute role="driver"><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="ride-requests" element={<RideRequests />} />
            <Route path="/driver/my-rides" element={<DriverBookings />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<PrivateRoute role="admin"><Layout /></PrivateRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/completed" element={<AdminBookings bookingStatus="completed" />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="drivers" element={<AdminDrivers />} />
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
