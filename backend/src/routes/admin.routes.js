// src/routes/admin.routes.js
const express = require('express');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const {
  getAdminStats,
  getAllUsers,
  getAllDrivers,
  updateDriverStatus,
  getAllBookings,
} = require('../controllers/admin.controller');

const router = express.Router();

router.get('/stats', verifyToken, isAdmin, getAdminStats);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.get('/drivers', verifyToken, isAdmin, getAllDrivers);
router.put('/drivers/:id/status', verifyToken, isAdmin, updateDriverStatus);
router.get('/bookings', verifyToken, isAdmin, getAllBookings);
router.get('/bookings/active', getActiveBookings);

module.exports = router;
