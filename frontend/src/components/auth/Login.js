import { Box, Grid, TextField, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import loginImage from '../../assets/hero-car.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default role

  const handleLogin = async () => {
    try {
      // Send login data to backend
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate based on role
        const userRole = data.user.role;
        if (userRole === 'user') {
          navigate('/user/UserDashboard');
        } else if (userRole === 'driver') {
          navigate('/driver/DriverDashboard');
        } else {
          alert('Invalid role');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left side form */}
      <Grid item xs={12} md={6} display="flex" alignItems="center" justifyContent="center">
        <Paper elevation={3} sx={{ p: 4, width: '80%', maxWidth: 400, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Welcome Back 👋
          </Typography>
          <Typography variant="body2" mb={3} color="text.secondary">
            Login to your Cab Account
          </Typography>

          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, bgcolor: '#feb800', color: '#000', fontWeight: 'bold' }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Paper>
      </Grid>

      {/* Right side image */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          backgroundImage: `url(${loginImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </Grid>
  );
};

export default Login;
