const Booking = require('../models/booking.model');
const User = require('../models/user.model');

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    console.log('=== Creating New Booking ===');
    const {
      pickup,
      dropoff,
      cabType,
      distance
    } = req.body;

    console.log('Booking details:', {
      pickup,
      dropoff,
      cabType,
      distance,
      userId: req.user._id
    });

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      pickup,
      dropoff,
      cabType,
      distance
    });

    // Calculate fare
    booking.fare = booking.calculateFare();
    console.log('Calculated fare:', booking.fare);

    // First try to find available drivers
    let availableDrivers = await User.find({
      role: 'driver',
      isAvailable: true
    }).select('name phoneNumber vehicle rating location');

    // If no available drivers, find any registered driver
    if (!availableDrivers || availableDrivers.length === 0) {
      console.log('No available drivers found, searching for any registered driver');
      availableDrivers = await User.find({
        role: 'driver'
      }).select('name phoneNumber vehicle rating location');
    }

    console.log('Total drivers found:', availableDrivers.length);

    if (!availableDrivers || availableDrivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No drivers registered in the system'
      });
    }

    // Randomly select a driver
    const randomIndex = Math.floor(Math.random() * availableDrivers.length);
    const selectedDriver = availableDrivers[randomIndex];

    console.log('Selected driver:', {
      id: selectedDriver._id,
      name: selectedDriver.name,
      isAvailable: selectedDriver.isAvailable
    });

    booking.driver = selectedDriver._id;
    booking.status = 'driver_assigned';
     await booking.save();
    // Update driver status

    console.log("Updating driver with ID:", selectedDriver._id);
console.log("Assigning booking ID:", booking._id);

    await User.findByIdAndUpdate(selectedDriver._id, {
  isAvailable: false,
  currentBooking: booking._id
});
    
    console.log('Driver assigned and status updated');
    console.log('Booking saved successfully');

    // Populate driver details for response
    await booking.populate('driver', 'name phoneNumber vehicle rating location');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking,
        driver: selectedDriver
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('driver', 'name phoneNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get driver's bookings
exports.getDriverBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driver: req.user._id })
      .populate('user', 'name phoneNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify that the driver is assigned to this booking
    if (booking.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;

    // Handle completion or cancellation
    if (status === 'completed') {
      booking.completedAt = Date.now();
      
      // Free up the driver
      await User.findByIdAndUpdate(req.user._id, {
        isAvailable: true,
        currentBooking: null
      });
    } else if (status === 'cancelled') {
      booking.cancelledAt = Date.now();
      booking.cancellationReason = req.body.cancellationReason;

      // Free up the driver
      await User.findByIdAndUpdate(req.user._id, {
        isAvailable: true,
        currentBooking: null
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// Get driver's earnings
exports.getDriverEarnings = async (req, res) => {
  try {
    const completedBookings = await Booking.find({
      driver: req.user._id,
      status: 'completed'
    });

    const totalEarnings = completedBookings.reduce((acc, booking) => acc + booking.fare, 0);
    const totalRides = completedBookings.length;
    const averageFare = totalRides > 0 ? totalEarnings / totalRides : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        totalRides,
        averageFare
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings',
      error: error.message
    });
  }
};

// Find nearest available driver
exports.findNearestDriver = async (req, res) => {
  try {
    console.log('=== Finding Available Driver ===');

    // First try to find available drivers
    let availableDrivers = await User.find({
      role: 'driver',
      isAvailable: true
    }).select('name phoneNumber vehicle rating location isAvailable');

    // If no available drivers, find any registered driver
    if (!availableDrivers || availableDrivers.length === 0) {
      console.log('No available drivers found, searching for any registered driver');
      availableDrivers = await User.find({
        role: 'driver'
      }).select('name phoneNumber vehicle rating location isAvailable');
    }

    console.log('Total drivers found:', availableDrivers.length);

    if (!availableDrivers || availableDrivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No drivers registered in the system'
      });
    }

    // Randomly select a driver
    const randomIndex = Math.floor(Math.random() * availableDrivers.length);
    const selectedDriver = availableDrivers[randomIndex];

    console.log('Randomly selected driver:', {
      id: selectedDriver._id,
      name: selectedDriver.name,
      isAvailable: selectedDriver.isAvailable
    });

    // If the selected driver was not available, mark them as available
    if (!selectedDriver.isAvailable) {
      selectedDriver.isAvailable = true;
      await selectedDriver.save();
      console.log('Updated driver availability status to true');
    }

    res.status(200).json({
      success: true,
      data: selectedDriver
    });
  } catch (error) {
    console.error('=== Driver Selection Error ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding driver',
      error: error.message
    });
  }
};

// Get driver's active ride
exports.getDriverActiveRide = async (req, res) => {
  try {
    const activeRide = await Booking.findOne({
      driver: req.user._id,
      status: { 
        $in: ['driver_assigned', 'on_the_way', 'picked_up', 'in_progress']
      }
    }).populate('user', 'name phoneNumber');

    res.status(200).json({
      success: true,
      data: activeRide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active ride',
      error: error.message
    });
  }
};

// Get driver's pending requests
exports.getDriverRequests = async (req, res) => {
  try {
    const pendingRequests = await Booking.find({
      status: 'pending',
      driver: null
    }).populate('user', 'name phoneNumber');

    res.status(200).json({
      success: true,
      data: pendingRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending requests',
      error: error.message
    });
  }
};

// Accept ride request
exports.acceptRideRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This ride has already been accepted or is no longer available'
      });
    }

    // Update booking with driver info and status
    booking.driver = req.user._id;
    booking.status = 'on_the_way';
    await booking.save();

    // Update driver status
    await User.findByIdAndUpdate(req.user._id, {
      isAvailable: false,
      currentBooking: booking._id
    });

    // Populate driver details
    await booking.populate('driver', 'name phoneNumber vehicle rating');

    res.status(200).json({
      success: true,
      message: 'Ride request accepted successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting ride request',
      error: error.message
    });
  }
};

// Reject ride request
exports.rejectRideRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This ride has already been accepted or is no longer available'
      });
    }

    // Mark the booking as rejected
    booking.status = 'rejected';
    booking.cancellationReason = 'Rejected by driver';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Ride request rejected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting ride request',
      error: error.message
    });
  }
};
export const getDriverEarnings = async (req, res) => {
  try {
    const driverId = req.user.id;  // Ensure your middleware sets `req.user`
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const bookings = await Booking.find({
      driver: driverId,
      status: 'completed',
      createdAt: { $gte: start, $lte: end },
    });

    const totalEarnings = bookings.reduce((sum, ride) => sum + ride.fare, 0);
    res.json({ totalEarnings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate driver earnings' });
  }
};
export const getUserSpendings = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const rides = await Booking.find({
      user: userId,
      status: 'completed',
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalSpent = rides.reduce((sum, ride) => sum + ride.fare, 0);
    res.json({ totalSpent });
  } catch (err) {
    res.status(500).json({ error: 'Error calculating spendings' });
  }
};
