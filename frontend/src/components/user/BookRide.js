import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Autocomplete,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  DirectionsCar,
  Phone,
  Star,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import Map from '../shared/Map';
import {
  searchLocations,
  calculateDistance,
  getPickupPoints
} from '../../services/locationService';
import { findNearestDriver, createBooking } from '../../services/bookingService';
import io from 'socket.io-client';

const cabTypes = [
  { id: 'economy', name: 'Economy', rate: 15 },
  { id: 'premium', name: 'Premium', rate: 25 },
  { id: 'luxury', name: 'Luxury', rate: 35 }
];

const BookRide = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  
  // Location states
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [dropoffSearchResults, setDropoffSearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false);
  
  // Booking states
  const [cabType, setCabType] = useState('economy');
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);
  
  // Map states
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapRoute, setMapRoute] = useState(null);

  // Reset booking form
  const resetForm = () => {
    setSelectedCity(null);
    setSelectedPickup(null);
    setSelectedDropoff(null);
    setCabType('economy');
    setDistance(null);
    setFare(null);
    setBooking(null);
    setDriver(null);
    setIsBooked(false);
    setError('');
  };

  // Handle city search
  const handleCitySearch = async (query) => {
    if (query.length < 2) {
      setCitySearchResults([]);
      return;
    }
    try {
      const results = await searchLocations(query);
      // Filter to only show cities
      const cityResults = results.filter(result => 
        result.type === 'city' || 
        result.type === 'town' || 
        result.type === 'village' ||
        result.type === 'administrative'
      );
      setCitySearchResults(cityResults);
    } catch (err) {
      console.error('Error searching cities:', err);
    }
  };

  // Handle city selection
  const handleCitySelect = async (city) => {
    if (!city) {
      setSelectedCity(null);
      setPickupPoints([]);
      return;
    }

    setSelectedCity(city);
    setLoadingPickupPoints(true);
    setError('');
    
    try {
      // Get the full city name including state
      const cityName = `${city.name}`;
      
      // Update map center immediately
      if (city.coordinates) {
        setMapCenter(city.coordinates);
      }

      // Get pickup points in background
      const points = await getPickupPoints(cityName);
      
      if (points.length === 0) {
        setError('No pickup points found in this city. Please try another city.');
      } else {
        setPickupPoints(points);
        // Update map markers
        setMapMarkers(points.map(point => ({
          position: point.coordinates,
          type: 'pickup',
          popup: point.name
        })));
      }
    } catch (err) {
      console.error('Error fetching pickup points:', err);
      setError('Failed to load pickup points. Please try again.');
    } finally {
      setLoadingPickupPoints(false);
    }
  };

  // Handle dropoff location search
  const handleDropoffSearch = async (query) => {
    if (query.length < 2) {
      setDropoffSearchResults([]);
      return;
    }
    const results = await searchLocations(query);
    setDropoffSearchResults(results);
  };

  // Calculate fare based on distance and cab type
  const calculateFare = () => {
    if (!distance) return;
    
    const ratePerKm = {
      economy: 15,
      premium: 25,
      luxury: 35
    };

    const calculatedFare = Math.round(distance * ratePerKm[cabType]);
    setFare(calculatedFare);
  };

  // Update distance and fare when pickup or dropoff changes
  useEffect(() => {
    if (selectedPickup && selectedDropoff) {
      const dist = calculateDistance(selectedPickup.coordinates, selectedDropoff.coordinates);
      setDistance(dist);
    }
  }, [selectedPickup, selectedDropoff]);

  // Update fare when distance or cab type changes
  useEffect(() => {
    if (distance) {
      calculateFare();
    }
  }, [distance, cabType]);

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedPickup || !selectedDropoff) {
        throw new Error('Please select pickup and drop-off locations');
      }

      // Find nearest driver
      let nearestDriver;
      try {
        nearestDriver = await findNearestDriver(selectedPickup.coordinates);
      } catch (driverError) {
        console.error('Driver finding error:', driverError);
        throw new Error('No drivers available at the moment. Please try again later.');
      }
      
      // Create booking
      const bookingData = {
        pickup: {
          location: {
            coordinates: selectedPickup.coordinates,
          },
          address: selectedPickup.fullAddress || selectedPickup.name
        },
        dropoff: {
          location: {
            coordinates: selectedDropoff.coordinates,
          },
          address: selectedDropoff.fullAddress || selectedDropoff.name
        },
        cabType,
        distance,
        fare
      };

      const response = await createBooking(bookingData);
      
      // Set driver and booking info
      setDriver(nearestDriver);
      setBooking(response.data.booking);
      setIsBooked(true);
      setError(''); // Clear any existing errors
      
      // Connect to socket for live tracking
      const socket = io(process.env.REACT_APP_SOCKET_URL);
      socket.on('driver-location-update', (data) => {
        if (data.driverId === nearestDriver.id) {
          setDriver(prev => ({
            ...prev,
            coordinates: data.coordinates,
            estimatedArrival: data.estimatedArrival
          }));
        }
      });

    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book ride');
      setIsBooked(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Book a Ride
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            {error && !isBooked && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isBooked && booking && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Booking confirmed! Your ride has been booked successfully.
                  </Typography>
                  <Button 
                    variant="outlined"
                    size="small"
                    onClick={resetForm}
                    sx={{ mt: 1 }}
                  >
                    Book Another Ride
                  </Button>
                </Box>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Autocomplete
                options={citySearchResults}
                getOptionLabel={(option) => option.name}
                onInputChange={(_, value) => handleCitySearch(value)}
                onChange={(_, value) => handleCitySelect(value)}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{option.name}</Typography>
                    <LocationOn sx={{ color: 'text.secondary', ml: 2 }} />
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search City"
                    required
                    fullWidth
                    margin="normal"
                  />
                )}
              />

              <Autocomplete
                options={pickupPoints}
                getOptionLabel={(option) => option.name}
                onChange={(_, value) => setSelectedPickup(value)}
                disabled={!selectedCity}
                loading={loadingPickupPoints}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    py: 1
                  }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="body1">{option.name}</Typography>
                      {option.fullAddress && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            whiteSpace: 'normal'
                          }}
                        >
                          {option.fullAddress}
                        </Typography>
                      )}
                    </Box>
                    <LocationOn sx={{ 
                      color: 'text.secondary',
                      mt: 0.5,
                      flexShrink: 0
                    }} />
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Pickup Point"
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loadingPickupPoints ? (
                            <CircularProgress 
                              color="inherit" 
                              size={20} 
                              sx={{ mr: 2 }}
                            />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                noOptionsText={
                  loadingPickupPoints ? "Loading pickup points..." : "No pickup points available"
                }
              />

              <Autocomplete
                options={dropoffSearchResults}
                getOptionLabel={(option) => option.name}
                onInputChange={(_, value) => handleDropoffSearch(value)}
                onChange={(_, value) => setSelectedDropoff(value)}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    py: 1
                  }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="body1">{option.name}</Typography>
                      {option.fullAddress && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            whiteSpace: 'normal'
                          }}
                        >
                          {option.fullAddress}
                        </Typography>
                      )}
                    </Box>
                    <LocationOn sx={{ 
                      color: 'text.secondary',
                      mt: 0.5,
                      flexShrink: 0
                    }} />
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Drop-off Location"
                    required
                    fullWidth
                    margin="normal"
                  />
                )}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Cab Type</InputLabel>
                <Select
                  value={cabType}
                  onChange={(e) => setCabType(e.target.value)}
                  label="Cab Type"
                >
                  {cabTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name} - ₹{type.rate}/km
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {distance && fare && (
                <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trip Details
                    </Typography>
                    <Typography>
                      Distance: {distance} km
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      Estimated Fare: ₹{fare}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={loading || !selectedPickup || !selectedDropoff || isBooked}
              >
                {loading ? 'Finding Driver...' : isBooked ? 'Ride Booked' : 'Book Now'}
              </Button>
            </form>
          </Paper>

          {/* Driver Details */}
          {driver && (
            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Driver Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <DirectionsCar />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={driver.name}
                    secondary={`${driver.vehicle.model} - ${driver.vehicle.color} (${driver.vehicle.number})`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Phone />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Contact"
                    secondary={driver.phone}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <Star />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Rating"
                    secondary={`${driver.rating} / 5`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AccessTime />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Estimated Arrival"
                    secondary={`${driver.estimatedArrival} minutes`}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={driver.statusNote}
                    sx={{
                      '& .MuiListItemText-secondary': {
                        color: driver.statusNote.includes('reassigned') ? 'warning.main' : 'success.main'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          )}
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 1, height: '600px' }}>
            <Map
              center={mapCenter}
              markers={mapMarkers}
              route={mapRoute}
              driverLocation={driver ? {
                position: driver.coordinates,
                driverName: driver.name,
                vehicleInfo: `${driver.vehicle.model} (${driver.vehicle.number})`
              } : null}
              height="100%"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookRide;