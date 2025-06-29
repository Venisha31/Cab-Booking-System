import { Grid, TextField, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import loginImage from '../../assets/hero-car.png';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      const loggedInUser = result.user;
      console.log('Logged in user role:', loggedInUser.role);
      if (loggedInUser.role === 'user') {
        navigate('/user/dashboard');
      } else if (loggedInUser.role === 'driver') {
        navigate('/driver/dashboard');
      } else if (loggedInUser.role === 'admin') {
        navigate('/admin/dashboard'); // fixed case: /admin (not /Admin)
      } else {
        alert('Invalid role');
      }
    } else {
      alert(result.message || 'Login failed');
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
            sx={{
              '& label.Mui-focused': { color: 'black' },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': { borderColor: 'black' },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& label.Mui-focused': { color: 'black' },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': { borderColor: 'black' },
              },
            }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              mt: 3,
              bgcolor: 'rgb(254, 184, 0)',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgb(230, 165, 0)',
              },
            }}
          >
            Login
          </Button>

          <Typography variant="body2" mt={2} textAlign="center">
            Don’t have an account?{' '}
            <Button
              variant="text"
              onClick={() => navigate('/register')}
              sx={{
                color: 'rgb(254, 184, 0)',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  color: 'rgb(230, 165, 0)',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Register
            </Button>
          </Typography>
        </Paper>
      </Grid>

      {/* Right side image */}
      <Grid
        item
        xs={false}
        md={6}
        sx={{
          background: 'linear-gradient(135deg, #000 30%, #feb800 100%)',
          clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={loginImage}
          alt="Login Visual"
          style={{
            width: '90%',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </Grid>
    </Grid>
  );
};

export default Login;
