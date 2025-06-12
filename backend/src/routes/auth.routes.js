const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register route
router.post('/register', authController.register);

// Login route with error handling
router.post('/login', async (req, res, next) => {
  console.log('Login route hit with body:', { 
    email: req.body.email,
    passwordProvided: !!req.body.password 
  });
  return authController.login(req, res, next);
});

// Protected route example
router.get('/me', authController.protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = router; 