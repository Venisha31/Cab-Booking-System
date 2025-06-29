const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserSpendings
} = require('../controllers/booking.controller.js');

// Dynamically import ES module middleware
let verifyToken, isUser;
(async () => {
  const middleware = await import('../middlewares/auth.middleware.js');
  verifyToken = middleware.verifyToken;
  isUser = middleware.isUser;
})();

// Existing routes (assumed working with CommonJS)
// If you're already using verifyToken and isUser with require in other routes, keep them untouched
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/bookings', getUserBookings);

// 👇 Updated Monthly Spendings Route
router.get('/spendings/monthly', (req, res, next) => {
  if (verifyToken && isUser) {
    verifyToken(req, res, (err) => {
      if (err) return next(err);
      isUser(req, res, next);
    });
  } else {
    res.status(503).json({ message: 'Middleware loading...' });
  }
}, getUserSpendings);

module.exports = router;
