const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key');
};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('=== Registration Request Start ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const registrationData = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: registrationData.email });
    if (existingUser) {
      console.log('User already exists:', registrationData.email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user data object
    const userData = {
      name: registrationData.name,
      email: registrationData.email,
      phoneNumber: registrationData.phoneNumber,
      password: registrationData.password,
      role: registrationData.role || 'user'
    };

    console.log('Processing registration for role:', userData.role);

    // Add driver specific data if registering as driver
    if (registrationData.role === 'driver') {
      console.log('Validating driver data:', {
        hasVehicle: !!registrationData.vehicle,
        vehicleDetails: registrationData.vehicle
      });

      if (!registrationData.vehicle || 
          !registrationData.vehicle.model || 
          !registrationData.vehicle.number || 
          !registrationData.vehicle.color) {
        console.log('Missing vehicle details');
        return res.status(400).json({
          success: false,
          message: 'Vehicle details are required for driver registration'
        });
      }

      // Set default location to Mumbai if not provided
      const defaultLocation = {
        type: 'Point',
        coordinates: [72.8777, 19.0760] // Mumbai coordinates
      };

      userData.vehicle = registrationData.vehicle;
      userData.location = registrationData.location || defaultLocation;
      userData.isAvailable = true;
      
      console.log('Driver data prepared:', {
        vehicle: userData.vehicle,
        location: userData.location,
        isAvailable: userData.isAvailable
      });

      // Verify location data structure
      if (!userData.location.type || !userData.location.coordinates || 
          !Array.isArray(userData.location.coordinates) || 
          userData.location.coordinates.length !== 2) {
        console.log('Invalid location format, using default location');
        userData.location = defaultLocation;
      }
    }

    console.log('Creating user with data:', {
      ...userData,
      password: '[HIDDEN]'
    });

    // Create new user
    const user = await User.create(userData);
    console.log('User created successfully with ID:', user._id);

    // If this is a driver, update their availability status
    if (user.role === 'driver') {
      await User.findByIdAndUpdate(user._id, { isAvailable: true });
    }

    // Generate token
    const token = signToken(user._id);

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      vehicle: user.vehicle,
      location: user.location,
      isAvailable: user.isAvailable
    };

    console.log('Registration successful:', userResponse);
    console.log('=== Registration Request End ===');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('=== Registration Error ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'This vehicle number is already registered'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Error in registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = signToken(user._id);

    // Create user response object without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber
    };

    console.log('Login successful:', userResponse);

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message
    });
  }
};

// Protect routes middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this resource'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource',
      error: error.message
    });
  }
};

// Role authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  };
}; 