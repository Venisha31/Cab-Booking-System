import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalBookings = await Booking.countDocuments();
    const activeCabs = await Booking.countDocuments({ status: 'driver_assigned' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    console.log("DEBUG Active Cabs:", activeCabs);


    res.json({
      totalUsers,
      totalDrivers,
      totalBookings,
      activeCabs,
      completedBookings,
      pendingBookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching admin stats', error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching drivers', error: err.message });
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const driver = await User.findByIdAndUpdate(id, { isApproved }, { new: true }).select('-password');
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, message: 'Driver status updated', driver });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating driver status', error: err.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')     // Only selected fields from user
      .populate('driver', 'name email phone');  // Only selected fields from driver

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: err.message
    });
  }
};
export const getActiveBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'driver_assigned' })
      .populate('user', 'name email')
      .populate('driver', 'name email');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active bookings',
      error: err.message
    });
  }
};

