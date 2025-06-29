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

  useEffect(() => {
    if (selectedPickup && selectedDropoff) {
      const dist = calculateDistance(selectedPickup.coordinates, selectedDropoff.coordinates);
      setDistance(dist);
    }
  }, [selectedPickup, selectedDropoff]);

  useEffect(() => {
    if (distance) {
      const ratePerKm = {
        economy: 15,
        premium: 25,
        luxury: 35
      };
      const calculatedFare = Math.round(distance * ratePerKm[cabType]);
      setFare(calculatedFare);
    }
  }, [distance, cabType]);

  useEffect(() => {
    const markers = [];
    if (pickupPoints.length > 0) {
      markers.push(...pickupPoints.map(point => ({
        position: point.coordinates,
        type: 'pickup',
        popup: point.name
      })));
    }
    if (selectedDropoff) {
      markers.push({
        position: selectedDropoff.coordinates,
        type: 'dropoff',
        popup: selectedDropoff.name
      });
    }
    setMapMarkers(markers);
  }, [pickupPoints, selectedDropoff]);

  const handleCitySearch = async (query) => {
    if (query.length < 2) return setCitySearchResults([]);
    try {
      const results = await searchLocations(query);
      const cityResults = results.filter(result =>
        ['city', 'town', 'village', 'administrative'].includes(result.type)
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
    try {
      if (city.coordinates) setMapCenter(city.coordinates);
      const points = await getPickupPoints(city.name);
      if (points.length === 0) setError('No pickup points found. Try another city.');
      else setPickupPoints(points);
    } catch (err) {
      console.error('Error fetching pickup points:', err);
      setError('Failed to load pickup points. Try again.');
    } finally {
      setLoadingPickupPoints(false);
    }
  };

  const handleDropoffSearch = async (query) => {
    if (query.length < 2) return setDropoffSearchResults([]);
    try {
      const results = await searchLocations(query);
      setDropoffSearchResults(results);
    } catch (err) {
      console.error('Drop-off search error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!selectedPickup || !selectedDropoff) throw new Error('Select pickup and drop-off');
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
      console.error('Booking error:', err);
      setError(err.message || 'Booking failed');
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
            {error && !isBooked && <Alert severity="error">{error}</Alert>}
            {isBooked && booking && (
              <Alert severity="success">
                Booking confirmed!
                <Button onClick={resetForm} sx={{ ml: 2 }}>Book Another</Button>
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Autocomplete
                options={citySearchResults}
                getOptionLabel={(option) => option.name}
                onInputChange={(_, value) => handleCitySearch(value)}
                onChange={(_, value) => handleCitySelect(value)}
                renderInput={(params) => <TextField {...params} label="Search City" required fullWidth margin="normal" />}
              />
              <Autocomplete
                options={pickupPoints}
                getOptionLabel={(option) => option.name}
                onChange={(_, value) => setSelectedPickup(value)}
                disabled={!selectedCity}
                loading={loadingPickupPoints}
                renderInput={(params) => (
                  <TextField {...params} label="Select Pickup Point" required fullWidth margin="normal" />
                )}
              />
              <Autocomplete
                options={dropoffSearchResults}
                getOptionLabel={(option) => option.name}
                onInputChange={(_, value) => handleDropoffSearch(value)}
                onChange={(_, value) => setSelectedDropoff(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Drop-off Location" required fullWidth margin="normal" />
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
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography>Distance: {distance} km</Typography>
                    <Typography variant="h6">Fare: ₹{fare}</Typography>
                  </CardContent>
                </Card>
              )}
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading || isBooked}>
                {loading ? 'Booking...' : isBooked ? 'Ride Booked' : 'Book Now'}
              </Button>
            </form>
          </Paper>
        </Grid>
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
