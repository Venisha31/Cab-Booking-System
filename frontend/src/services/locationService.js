import axios from 'axios';
import * as turf from '@turf/turf';
import api from './api';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Cache for pickup points with expiration
const pickupPointsCache = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Function to check if cache is valid
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry || !cacheEntry.timestamp) return false;
  return (Date.now() - cacheEntry.timestamp) < CACHE_EXPIRY;
};

// Format address nicely
const formatAddress = (address) => {
  const parts = [];
  if (address.road) parts.push(address.road);
  if (address.suburb) parts.push(address.suburb);
  if (address.city || address.town || address.village) {
    parts.push(address.city || address.town || address.village);
  }
  if (address.state) parts.push(address.state);
  return parts.join(', ');
};

// ✅ Updated: Search locations via secure HTTPS
export const searchLocations = async (query) => {
  try {
    const { data } = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        countrycodes: 'in',
        addressdetails: 1,
        format: 'json',
        limit: 10
      }
    });

    return data.map(result => ({
      id: result.place_id,
      name: result.display_name.split(',')[0],
      fullAddress: formatAddress(result.address),
      coordinates: [parseFloat(result.lat), parseFloat(result.lon)],
      type: result.type,
      city: result.address?.city || result.address?.town || result.address?.village || result.address?.county,
      state: result.address?.state
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

// ✅ Distance calculator
export const calculateDistance = (point1, point2) => {
  try {
    const from = turf.point([point1[1], point1[0]]);
    const to = turf.point([point2[1], point2[0]]);
    const distance = turf.distance(from, to);
    return Math.round(distance * 10) / 10;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
};

// ✅ Updated: Search specific types of locations securely
const searchLocationByType = async (cityName, type, limit = 2) => {
  try {
    const { data } = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: `${cityName} ${type}`,
        countrycodes: 'in',
        addressdetails: 1,
        format: 'json',
        limit
      }
    });

    return data.map(place => ({
      id: place.place_id,
      name: place.display_name.split(',')[0],
      fullAddress: formatAddress(place.address),
      coordinates: [parseFloat(place.lat), parseFloat(place.lon)],
      type: place.type || type,
      distance: place.importance || 0
    }));
  } catch (err) {
    console.error(`Error searching for ${type}:`, err);
    return [];
  }
};

// ✅ Main pickup point generator (updated to use HTTPS)
export const getPickupPoints = async (city) => {
  try {
    const cityName = city.split(',')[0].trim();

    const cacheEntry = pickupPointsCache.get(cityName);
    if (isCacheValid(cacheEntry)) {
      console.log('Returning cached pickup points for:', cityName);
      return cacheEntry.data;
    }

    console.log('Fetching pickup points for:', cityName);

    const locationTypes = [
      { type: 'railway station', limit: 2 },
      { type: 'bus station', limit: 2 },
      { type: 'airport', limit: 1 },
      { type: 'shopping mall', limit: 2 },
      { type: 'hospital', limit: 2 },
      { type: 'landmark', limit: 3 }
    ];

    const results = [];
    const batchSize = 2;

    for (let i = 0; i < locationTypes.length; i += batchSize) {
      const batch = locationTypes.slice(i, i + batchSize);
      const batchPromises = batch.map(({ type, limit }) =>
        searchLocationByType(cityName, type, limit)
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      if (i + batchSize < locationTypes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const allPoints = results.flat();
    const uniquePoints = Array.from(new Map(allPoints.map(p => [p.id, p])).values());

    const formattedPoints = uniquePoints
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 12);

    if (formattedPoints.length > 0) {
      pickupPointsCache.set(cityName, {
        data: formattedPoints,
        timestamp: Date.now()
      });
      return formattedPoints;
    }

    const defaultPoints = [
      {
        id: 'railway_station',
        name: `${cityName} Railway Station`,
        fullAddress: `Railway Station, ${cityName}`,
        coordinates: [19.0760, 72.8777],
        type: 'transport',
        distance: 1
      },
      {
        id: 'bus_stand',
        name: `${cityName} Bus Stand`,
        fullAddress: `Central Bus Stand, ${cityName}`,
        coordinates: [19.0760, 72.8777],
        type: 'transport',
        distance: 1
      },
      {
        id: 'city_center',
        name: `${cityName} City Center`,
        fullAddress: `City Center, ${cityName}`,
        coordinates: [19.0760, 72.8777],
        type: 'place',
        distance: 1
      }
    ];

    pickupPointsCache.set(cityName, {
      data: defaultPoints,
      timestamp: Date.now()
    });

    return defaultPoints;
  } catch (error) {
    console.error('Error getting pickup points:', error);
    return [];
  }
};

// ✅ Nearest driver API call
export const findNearestDriver = async (pickupCoordinates) => {
  try {
    const response = await api.post('/api/bookings/find-driver', {
      pickupCoordinates
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'No drivers available');
    }

    const driver = response.data.data;
    return {
      id: driver._id,
      name: driver.name,
      phone: driver.phoneNumber,
      vehicle: driver.vehicle || {
        model: 'Not specified',
        number: 'Not specified',
        color: 'Not specified'
      },
      rating: driver.rating || 4.0,
      coordinates: driver.location.coordinates,
      estimatedArrival: Math.floor(Math.random() * 10) + 5
    };
  } catch (error) {
    console.error('Error finding driver:', error);
    throw new Error(error.response?.data?.message || 'No drivers available at the moment. Please try again later.');
  }
};
