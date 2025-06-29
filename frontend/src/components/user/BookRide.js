// ⬇️ All import statements same as yours
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, Alert, Autocomplete, Card,
  CardContent, Avatar, List, ListItem, ListItemText, ListItemAvatar,
  Divider, CircularProgress
} from '@mui/material';
import {
  LocationOn, DirectionsCar, Phone, Star, AccessTime
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import Map from '../shared/Map';
import {
  searchLocations, calculateDistance, getPickupPoints
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

  const [citySearchResults, setCitySearchResults] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [dropoffSearchResults, setDropoffSearchResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDropoff, setSelectedDropoff] = useState(null);
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false);

  const [cabType, setCabType] = useState('economy');
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapRoute, setMapRoute] = useState(null);

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

  // 📍 Update map markers based on pickup & dropoff
  useEffect(() => {
    const markers = [];
    if (selectedPickup) {
      markers.push({
        position: selectedPickup.coordinates,
        type: 'pickup',
        popup: selectedPickup.name
      });
    }
    if (selectedDropoff) {
      markers.push({
        position: selectedDropoff.coordinates,
        type: 'dropoff',
        popup: selectedDropoff.name
      });
    }
    setMapMarkers(markers);
  }, [selectedPickup, selectedDropoff]);

  // 📏 Distance calculation
  useEffect(() => {
    if (selectedPickup && selectedDropoff) {
      const dist = calculateDistance(selectedPickup.coordinates, selectedDropoff.coordinates);
      setDistance(Math.round(dist * 10) / 10); // Round to 1 decimal
    }
  }, [selectedPickup, selectedDropoff]);

  useEffect(() => {
    if (distance) {
      const rate = cabTypes.find(c => c.id === cabType)?.rate || 15;
      const calculatedFare = Math.round(distance * rate);
      setFare(calculatedFare);
    }
  }, [distance, cabType]);

  const handleCitySearch = async (query) => {
    if (query.length < 2) return setCitySearchResults([]);
    try {
      const results = await searchLocations(query);
      const cityResults = results.filter(r =>
        ['city', 'town', 'village', 'administrative'].includes(r.type)
      );
      setCitySearchResults(cityResults);
    } catch (err) {
      console.error('Error searching cities:', err);
    }
  };

  const handleCitySelect = async (city) => {
    if (!city) return setSelectedCity(null);
    setSelectedCity(city);
    setLoadingPickupPoints(true);
    setError('');
    if (city.coordinates) setMapCenter(city.coordinates);
    try {
      const points = await getPickupPoints(city.name);
      if (points.length === 0) setError('No pickup points found. Try another city.');
      setPickupPoints(points);
    } catch (err) {
      setError('Failed to load pickup points.');
    } finally {
      setLoadingPickupPoints(false);
    }
  };

  const handleDropoffSearch = async (query) => {
    if (query.length < 2) return setDropoffSearchResults([]);
    const results = await searchLocations(query);
    setDropoffSearchResults(results);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedPickup || !selectedDropoff) {
        throw new Error('Please select both pickup and drop-off');
      }

      const nearestDriver = await findNearestDriver(selectedPickup.coordinates);

      const bookingData = {
        pickup: {
          location: { coordinates: selectedPickup.coordinates },
          address: selectedPickup.fullAddress || selectedPickup.name
        },
        dropoff: {
          location: { coordinates: selectedDropoff.coordinates },
          address: selectedDropoff.fullAddress || selectedDropoff.name
        },
        cabType,
        distance,
        fare
      };

      const response = await createBooking(bookingData);
      setDriver(nearestDriver);
      setBooking(response.data.booking);
      setIsBooked(true);

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
      setError(err.message || 'Booking failed');
      setIsBooked(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Book a Ride</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            {error && !isBooked && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {isBooked && booking && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography>Booking confirmed!</Typography>
                <Button onClick={resetForm} sx={{ mt: 1 }}>Book Another</Button>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              {/* City Search */}
              <Autocomplete
                options={citySearchResults}
                getOptionLabel={(option) => option.name}
                onInputChange={(_, value) => handleCitySearch(value)}
                onChange={(_, value) => handleCitySelect(value)}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
                    <span>{option.name}</span>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Search City" required fullWidth margin="normal" />
                )}
              />

              {/* Pickup */}
              <Autocomplete
                options={pickupPoints}
                getOptionLabel={(option) => option.name}
                onChange={(_, value) => setSelectedPickup(value)}
                loading={loadingPickupPoints}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography>{option.name}</Typography>
                    {option.fullAddress && (
                      <Typography variant="caption" color="text.secondary">
                        {option.fullAddress}
                      </Typography>
                    )}
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
                        <>
                          {loadingPickupPoints && <CircularProgress size={20} sx={{ mr: 2 }} />}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />

              {/* Drop-off */}
              <Autocomplete
                options={dropoffSearchResults}
                getOptionLabel={(option) => option.name}
                onInputChange={(_, value) => handleDropoffSearch(value)}
                onChange={(_, value) => setSelectedDropoff(value)}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography>{option.name}</Typography>
                    {option.fullAddress && (
                      <Typography variant="caption" color="text.secondary">
                        {option.fullAddress}
                      </Typography>
                    )}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Search Drop-off Location" required fullWidth margin="normal" />
                )}
              />

              {/* Cab Type */}
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

              {/* Fare Summary */}
              {distance && fare && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography>Distance: {distance} km</Typography>
                    <Typography variant="h6">Estimated Fare: ₹{fare}</Typography>
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

            {/* Driver Details */}
            {driver && (
              <Paper sx={{ mt: 3, p: 3 }}>
                <Typography variant="h6" gutterBottom>Driver Details</Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar><Avatar><DirectionsCar /></Avatar></ListItemAvatar>
                    <ListItemText
                      primary={driver.name}
                      secondary={`${driver.vehicle.model} - ${driver.vehicle.color} (${driver.vehicle.number})`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemAvatar><Avatar><Phone /></Avatar></ListItemAvatar>
                    <ListItemText primary="Contact" secondary={driver.phone} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemAvatar><Avatar><Star /></Avatar></ListItemAvatar>
                    <ListItemText primary="Rating" secondary={`${driver.rating} / 5`} />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemAvatar><Avatar><AccessTime /></Avatar></ListItemAvatar>
                    <ListItemText primary="ETA" secondary={`${driver.estimatedArrival} mins`} />
                  </ListItem>
                </List>
              </Paper>
            )}
          </Paper>
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
