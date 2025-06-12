import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
      // Driver specific fields
      vehicleModel: '',
      vehicleNumber: '',
      vehicleColor: ''
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      phoneNumber: Yup.string()
        .matches(/^\d{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      role: Yup.string()
        .oneOf(['user', 'driver'], 'Invalid role')
        .required('Role is required'),
      vehicleModel: Yup.string().when('role', {
        is: 'driver',
        then: () => Yup.string().required('Vehicle model is required for drivers'),
        otherwise: () => Yup.string()
      }),
      vehicleNumber: Yup.string().when('role', {
        is: 'driver',
        then: () => Yup.string().required('Vehicle number is required for drivers'),
        otherwise: () => Yup.string()
      }),
      vehicleColor: Yup.string().when('role', {
        is: 'driver',
        then: () => Yup.string().required('Vehicle color is required for drivers'),
        otherwise: () => Yup.string()
      })
    }),
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        
        // Add vehicle information for drivers
        if (values.role === 'driver') {
          registerData.vehicle = {
            model: values.vehicleModel,
            number: values.vehicleNumber,
            color: values.vehicleColor
          };
          // Set initial location (can be updated later)
          registerData.location = {
            type: 'Point',
            coordinates: [72.8777, 19.0760] // Default location (Mumbai)
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
        setError('An error occurred during registration');
      }
    }
  });

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Register
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              id="phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              margin="normal"
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formik.values.role}
                label="Role"
                onChange={formik.handleChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
              </Select>
            </FormControl>

            <Collapse in={formik.values.role === 'driver'}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Vehicle Details
                </Typography>
                <TextField
                  margin="normal"
                  fullWidth
                  name="vehicleModel"
                  label="Vehicle Model"
                  id="vehicleModel"
                  value={formik.values.vehicleModel}
                  onChange={formik.handleChange}
                  error={formik.touched.vehicleModel && Boolean(formik.errors.vehicleModel)}
                  helperText={formik.touched.vehicleModel && formik.errors.vehicleModel}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="vehicleNumber"
                  label="Vehicle Number"
                  id="vehicleNumber"
                  value={formik.values.vehicleNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.vehicleNumber && Boolean(formik.errors.vehicleNumber)}
                  helperText={formik.touched.vehicleNumber && formik.errors.vehicleNumber}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="vehicleColor"
                  label="Vehicle Color"
                  id="vehicleColor"
                  value={formik.values.vehicleColor}
                  onChange={formik.handleChange}
                  error={formik.touched.vehicleColor && Boolean(formik.errors.vehicleColor)}
                  helperText={formik.touched.vehicleColor && formik.errors.vehicleColor}
                />
              </Box>
            </Collapse>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login">
                Already have an account? Login
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 