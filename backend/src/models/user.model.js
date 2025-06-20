const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const vehicleSchema = new mongoose.Schema({
  model: {
    type: String,
    required: [true, 'Vehicle model is required for drivers']
  },
  number: {
    type: String,
    required: [true, 'Vehicle number is required for drivers'],
    unique: true
  },
  color: {
    type: String,
    required: [true, 'Vehicle color is required for drivers']
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide your phone number'],
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  role: {
  type: String,
  enum: ['user', 'driver', 'admin'],
  default: 'user',
},
  vehicle: {
    type: vehicleSchema,
    required: function() {
      return this.role === 'driver';
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.0
  },
  currentBooking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for location-based queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 