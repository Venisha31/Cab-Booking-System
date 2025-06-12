import Nominatim from 'nominatim-geocoder';
import * as turf from '@turf/turf';
import axios from 'axios';
import api from './api';

const geocoder = new Nominatim();

// Cache for pickup points with expiration
const pickupPointsCache = new Map();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Function to check if cache is valid
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry || !cacheEntry.timestamp) return false;
  return (Date.now() - cacheEntry.timestamp) < CACHE_EXPIRY;
};

// Function to format address parts
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

export const searchLocations = async (query) => {
  try {
    const results = await geocoder.search({ 
      q: query, 
      countrycodes: 'in',
      addressdetails: 1,
      limit: 10
    });
    return results.map(result => ({
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

export const calculateDistance = (point1, point2) => {
  try {
    const from = turf.point([point1[1], point1[0]]);
    const to = turf.point([point2[1], point2[0]]);
    const distance = turf.distance(from, to);
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
};

// Function to search for specific location type with better address formatting
const searchLocationByType = async (cityName, type, limit = 2) => {
  try {
    const response = await geocoder.search({
      q: `${cityName} ${type}`,
      countrycodes: 'in',
      addressdetails: 1,
      limit
    });
    return response.map(place => ({
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

export const getPickupPoints = async (city) => {
  try {
    // Extract city name without state/country
    const cityName = city.split(',')[0].trim();
    
    // Check cache first
    const cacheEntry = pickupPointsCache.get(cityName);
    if (isCacheValid(cacheEntry)) {
      console.log('Returning cached pickup points for:', cityName);
      return cacheEntry.data;
    }

    console.log('Fetching pickup points for:', cityName);

    // Define location types to search for
    const locationTypes = [
      { type: 'railway station', limit: 2 },
      { type: 'bus station', limit: 2 },
      { type: 'airport', limit: 1 },
      { type: 'shopping mall', limit: 2 },
      { type: 'hospital', limit: 2 },
      { type: 'landmark', limit: 3 }
    ];

    // Search for all location types in parallel with a small delay between batches
    const results = [];
    const batchSize = 2;
    
    for (let i = 0; i < locationTypes.length; i += batchSize) {
      const batch = locationTypes.slice(i, i + batchSize);
      const batchPromises = batch.map(({ type, limit }) => 
        searchLocationByType(cityName, type, limit)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a small delay between batches to prevent rate limiting
      if (i + batchSize < locationTypes.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Combine all results and remove duplicates
    const allPoints = results.flat();
    const uniquePoints = Array.from(
      new Map(
        allPoints.map(point => [point.id, point])
      ).values()
    );

    // Sort by importance and limit results
    const formattedPoints = uniquePoints
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 12); // Keep top 12 points

    if (formattedPoints.length > 0) {
      // Cache the results with timestamp
      pickupPointsCache.set(cityName, {
        data: formattedPoints,
        timestamp: Date.now()
      });
      return formattedPoints;
    }

    // Fallback to default points if no results found
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

    // Cache the default points
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

export const findNearestDriver = async (pickupCoordinates) => {
  try {
    const response = await api.post('/api/bookings/find-driver', {
      pickupCoordinates
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'No drivers available');
    }

    const driver = response.data.data;
    if (!driver) {
      throw new Error('No drivers available at the moment. Please try again later.');
    }

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
      estimatedArrival: Math.floor(Math.random() * 10) + 5 // 5-15 minutes
    };
  } catch (error) {
    console.error('Error finding driver:', error);
    throw new Error(error.response?.data?.message || 'No drivers available at the moment. Please try again later.');
  }
}; 