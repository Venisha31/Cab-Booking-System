import axios from 'axios';

// Search for locations using OpenStreetMap's Nominatim service
export const searchLocations = async (query) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    );

    return response.data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

// Get location details from coordinates
export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );

    return {
      name: response.data.display_name,
      coordinates: [parseFloat(response.data.lat), parseFloat(response.data.lon)]
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Calculate distance between two points in kilometers
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(coord2[0] - coord1[0]);
  const dLon = deg2rad(coord2[1] - coord1[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1[0])) * Math.cos(deg2rad(coord2[0])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
}; 