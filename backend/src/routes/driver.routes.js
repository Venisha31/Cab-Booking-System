const express = require('express');
const router = express.Router();
const {
  getDriverProfile,
  getDriverBookings,
  updateBookingStatus,
  getDriverEarnings,
  getMonthlyDriverEarnings,
  getDriverRequests,
  acceptRideRequest,
  rejectRideRequest,
  getDriverActiveRide
} = require('../controllers/booking.controller.js');

// Dynamic ES module middleware import
let verifyToken, isDriver;
(async () => {
  const middleware = await import('../middlewares/auth.middleware.js');
  verifyToken = middleware.verifyToken;
  isDriver = middleware.isDriver;
})();

// Existing routes (CommonJS ones untouched)
router.get('/profile', getDriverProfile);
router.get('/bookings', getDriverBookings);

// 👇 Monthly Earnings Route using dynamic middleware
router.get('/earnings/monthly', (req, res, next) => {
  if (verifyToken && isDriver) {
    verifyToken(req, res, (err) => {
      if (err) return next(err);
      isDriver(req, res, next);
    });
  } else {
    res.status(503).json({ message: 'Middleware loading...' });
  }
}, getMonthlyDriverEarnings);

module.exports = router;
