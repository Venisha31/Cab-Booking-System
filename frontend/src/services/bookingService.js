import api from '../utils/axios';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create booking');
  }
};

// Find nearest driver
export const findNearestDriver = async (pickupCoordinates) => {
  try {
    const response = await api.post('/api/bookings/find-driver', {
      pickupCoordinates
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'No drivers registered in the system');
    }

    const driver = response.data.data;
    if (!driver) {
      throw new Error('No drivers registered in the system. Please try again later.');
    }

    // Add a note if the driver was previously busy but has been made available
    const statusNote = !driver.isAvailable ? 
      'Driver has been reassigned from another booking' : 
      'Driver is ready for pickup';

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
      estimatedArrival: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
      statusNote: statusNote
    };
  } catch (error) {
    console.error('Error finding driver:', error);
    throw new Error(error.response?.data?.message || 'No drivers available at the moment. Please try again later.');
  }
};

// Get user's bookings
export const getUserBookings = async () => {
  try {
    const response = await api.get('/api/bookings/user-bookings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/api/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update booking status');
  }
}; 
export const fetchMonthlyEarnings = async () => {
  const res = await api.get('/api/driver/earnings/monthly');
  return res.data.data;
};

export const fetchMonthlySpendings = async () => {
  const res = await api.get('/api/user/spendings/monthly');
  return res.data.data;
};
