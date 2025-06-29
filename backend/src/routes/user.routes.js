const express = require('express');
const router = express.Router();

// Import only existing functions
const {
  getUserBookings,
  getUserSpendings,
} = require('../controllers/booking.controller');

const {
  getUserProfile,
  updateUserProfile,
} = require('../controllers/user.controller');

// Middleware (dynamic ES module loader)
let verifyToken, isUser;
(async () => {
  const middleware = await import('../middlewares/auth.js');
  verifyToken = middleware.verifyToken;
  isUser = middleware.isUser;
})();

// Routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/bookings', getUserBookings);

// Monthly Spendings (with async middleware check)
router.get(
  '/spendings/monthly',
  (req, res, next) => {
    if (verifyToken && isUser) {
      verifyToken(req, res, (err) => {
        if (err) return next(err);
        isUser(req, res, next);
      });
    } else {
      res.status(503).json({ message: 'Middleware loading...' });
    }
  },
  getUserSpendings
);

module.exports = router;
