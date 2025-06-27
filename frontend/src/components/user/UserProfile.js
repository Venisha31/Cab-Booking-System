import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import axios from 'axios';

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({ name: user.name || '', email: user.email || '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      const res = await axios.put('https://cab-booking-system-csfj.onrender.com/api/users/update-profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Profile updated');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Paper sx={{ p: 4, m: 3 }}>
      <Typography variant="h5" mb={2}>My Profile</Typography>
      <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} sx={{ mb: 2 }} />
      <Button variant="contained" onClick={handleUpdate}>Update Profile</Button>
    </Paper>
  );
};

export default UserProfile;
