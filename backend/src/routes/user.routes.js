const express = require('express');
const { protect, authorize } = require('../controllers/auth.controller');
const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('user'));

// Get user profile
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const user = req.user;

    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update user location
router.put('/location', async (req, res) => {
  try {
    const { coordinates } = req.body;
    const user = req.user;

    user.location.coordinates = coordinates;
    await user.save();

    res.status(200).json({
      success: true,
      data: user.location
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 