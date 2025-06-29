import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroCar from '../../assets/hero-car.png';

const HomePage = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    alert('Please login first.');
    navigate('/login');
  };

  return (
    <>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#000', boxShadow: 'none' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
            CabXpress
          </Typography>
          <Box>
            <Button onClick={() => navigate('/login')} sx={{ color: '#fff', fontWeight: 'bold' }}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')} sx={{ color: '#fff', fontWeight: 'bold' }}>
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: '90vh',
          bgcolor: '#000',
          color: '#fff',
        }}
      >
        {/* Left Content */}
        <Container
          maxWidth="md"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
            px: { xs: 3, md: 10 },
            py: { xs: 6, md: 0 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              mb={2}
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
            >
              Book Your Ride. Anytime. Anywhere.
            </Typography>
            <Typography
              variant="h6"
              mb={4}
              sx={{ color: '#ccc', fontSize: { xs: '1rem', md: '1.25rem' } }}
            >
              Safe, Fast and Reliable Cab Service.
            </Typography>
            <Button
              variant="contained"
              onClick={handleBookNow}
              sx={{
                bgcolor: '#feb800',
                color: '#000',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#e6a900',
                },
              }}
            >
              Book Now
            </Button>
          </motion.div>
        </Container>

        {/* Right Image */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            backgroundColor: '#feb800',
            clipPath: {
              xs: 'none',
              md: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%)',
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            py: { xs: 4, md: 0 },
          }}
        >
          <motion.img
            src={heroCar}
            alt="Hero Car"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{
              maxWidth: '80%',
              height: 'auto',
              zIndex: 2,
              position: 'relative',
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default HomePage;
