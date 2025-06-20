import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import loginImage from '../../assets/hero-car.png';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      vehicleModel: '',
      vehicleNumber: '',
      vehicleColor: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phoneNumber: Yup.string().matches(/^\d{10}$/, 'Must be 10 digits').required('Required'),
      password: Yup.string().min(8, 'Min 8 characters').required('Required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Required'),
      role: Yup.string().oneOf(['user', 'driver'], 'Invalid role').required('Required'),
      vehicleModel: Yup.string().when('role', {
        is: 'driver',
        then: () => Yup.string().required('Required for drivers'),
        otherwise: () => Yup.string(),
      }),
      vehicleNumber: Yup.string().when('role', {
        is: 'driver',
        then: () => Yup.string().required('Required for drivers'),
        otherwise: () => Yup.string(),
      }),
      vehicleColor: Yup.string().when('role', {
        is: 'driver',
        then: () => Yup.string().required('Required for drivers'),
        otherwise: () => Yup.string(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;

        if (values.role === 'driver') {
          registerData.vehicle = {
            model: values.vehicleModel,
            number: values.vehicleNumber,
            color: values.vehicleColor,
          };
          registerData.location = {
            type: 'Point',
            coordinates: [72.8777, 19.0760],
          };
          registerData.isAvailable = true;
        }

        const result = await register(registerData);
        if (result.success) {
          navigate('/login');
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Error during registration');
      }
    },
  });

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Form Section */}
      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ backgroundColor: '#fff', px: 2 }}
      >
        <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 480, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" mb={2}>
            Create Account 🚖
          </Typography>
          <Typography variant="body2" mb={3} color="text.secondary">
            Register for CabXpress
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              label="Full Name"
              name="name"
              fullWidth
              margin="normal"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{
                '& label.Mui-focused': {
                  color: '#000', // Label text turns black on focus
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#000', // Border turns black on focus
                  },
                },
              }}
            />

            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                '& label.Mui-focused': {
                  color: '#000', // Label text turns black on focus
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#000', // Border turns black on focus
                  },
                },
              }}
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              fullWidth
              margin="normal"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              sx={{
                '& label.Mui-focused': {
                  color: '#000', // Label text turns black on focus
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#000', // Border turns black on focus
                  },
                },
              }}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                '& label.Mui-focused': {
                  color: '#000',
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                },
              }}
            />

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              margin="normal"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              sx={{
                '& label.Mui-focused': {
                  color: '#000',
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                  },
                },
              }}
            />

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                '& label.Mui-focused': {
                  color: '#000',
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000',
                  },
                },
              }}
            >
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
              </Select>
            </FormControl>


            <Collapse in={formik.values.role === 'driver'}>
              <Typography variant="subtitle1" mt={2}>
                Vehicle Info
              </Typography>
              <TextField
                label="Vehicle Model"
                name="vehicleModel"
                fullWidth
                margin="normal"
                value={formik.values.vehicleModel}
                onChange={formik.handleChange}
                error={formik.touched.vehicleModel && Boolean(formik.errors.vehicleModel)}
                helperText={formik.touched.vehicleModel && formik.errors.vehicleModel}
                sx={{
                  '& label.Mui-focused': {
                    color: '#000',
                  },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#000',
                    },
                  },
                }}
              />

              <TextField
                label="Vehicle Number"
                name="vehicleNumber"
                fullWidth
                margin="normal"
                value={formik.values.vehicleNumber}
                onChange={formik.handleChange}
                error={formik.touched.vehicleNumber && Boolean(formik.errors.vehicleNumber)}
                helperText={formik.touched.vehicleNumber && formik.errors.vehicleNumber}
                sx={{
                  '& label.Mui-focused': {
                    color: '#000',
                  },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#000',
                    },
                  },
                }}
              />

              <TextField
                label="Vehicle Color"
                name="vehicleColor"
                fullWidth
                margin="normal"
                value={formik.values.vehicleColor}
                onChange={formik.handleChange}
                error={formik.touched.vehicleColor && Boolean(formik.errors.vehicleColor)}
                helperText={formik.touched.vehicleColor && formik.errors.vehicleColor}
                sx={{
                  '& label.Mui-focused': {
                    color: '#000',
                  },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#000',
                    },
                  },
                }}
              />

            </Collapse>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, bgcolor: '#feb800', color: '#000', fontWeight: 'bold' }}
            >
              Register
            </Button>

            <Typography variant="body2" mt={2} textAlign="center">
              Already have an account?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: '#feb800', textTransform: 'none', fontWeight: 'bold' }}
              >
                Login
              </Button>
            </Typography>
          </form>
        </Paper>
      </Grid>

      {/* Right Side Triangle Image */}
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
          alt="Register Visual"
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

export default Register;
