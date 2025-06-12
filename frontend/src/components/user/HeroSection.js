// src/components/user/HomePage.tsx
import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import heroCar from '../../assets/hero-car.png';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: '#000' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">CabXpress</Typography>
          <Box>
            <Button onClick={() => navigate('/login')} sx={{ color: '#fff' }}>Login</Button>
            <Button onClick={() => navigate('/register')} sx={{ color: '#fff' }}>Register</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', bgcolor: '#000', color: '#fff', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <Container sx={{ zIndex: 2 }}>
          <Typography variant="h3" fontWeight="bold" mb={2}>
            Book Your Ride. Anytime. Anywhere.
          </Typography>
          <Typography variant="h6" mb={4}>
            Trusted cab service at your fingertips.
          </Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: '#feb800', color: '#000', fontWeight: 'bold' }}
            onClick={() => navigate('/book-ride')}
          >
            Book Now
          </Button>
        </Container>

        {/* Triangle + Car Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
            backgroundColor: '#feb800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <img src={heroCar} alt="Hero Car" style={{ maxWidth: '80%', height: 'auto' }} />
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
