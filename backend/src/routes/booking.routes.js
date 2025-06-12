const express = require('express');
const {
  createBooking,
  getUserBookings,
  getDriverBookings,
  updateBookingStatus,
  getDriverEarnings,
  findNearestDriver,
  getDriverActiveRide,
  getDriverRequests,
  acceptRideRequest,
  rejectRideRequest
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Public routes (for authenticated users)
router.post('/', authorize('user'), createBooking);
router.post('/find-driver', findNearestDriver);
router.get('/user-bookings', authorize('user'), getUserBookings);

// Driver routes
router.get('/driver-active', authorize('driver'), getDriverActiveRide);
router.get('/driver-requests', authorize('driver'), getDriverRequests);
router.put('/:id/accept', authorize('driver'), acceptRideRequest);
router.put('/:id/reject', authorize('driver'), rejectRideRequest);
router.get('/driver-bookings', authorize('driver'), getDriverBookings);
router.put('/:id/status', authorize('driver'), updateBookingStatus);
router.get('/driver-earnings', authorize('driver'), getDriverEarnings);

module.exports = router; 