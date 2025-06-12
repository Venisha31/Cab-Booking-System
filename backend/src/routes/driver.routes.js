const express = require('express');
const { protect, authorize } = require('../controllers/auth.controller');
const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('driver'));

// Get driver profile
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Update driver profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const driver = req.user;

    driver.name = name || driver.name;
    driver.phoneNumber = phoneNumber || driver.phoneNumber;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update driver location
router.put('/location', async (req, res) => {
  try {
    const { coordinates } = req.body;
    const driver = req.user;

    driver.location.coordinates = coordinates;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver.location
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Update driver availability
router.put('/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const driver = req.user;

    driver.isAvailable = isAvailable;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 