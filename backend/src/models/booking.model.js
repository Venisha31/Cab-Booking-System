const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  pickup: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Pickup location coordinates are required']
      }
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    }
  },
  dropoff: {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Dropoff location coordinates are required']
      }
    },
    address: {
      type: String,
      required: [true, 'Dropoff address is required']
    }
  },
  cabType: {
    type: String,
    enum: ['economy', 'basic', 'premium'],
    required: [true, 'Cab type is required']
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required']
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required']
  },
  status: {
    type: String,
    enum: [
      'pending',
      'driver_assigned',
      'on_the_way',
      'picked_up',
      'in_progress',
      'completed',
      'cancelled'
    ],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
});

// Create indexes for location-based queries
bookingSchema.index({ 'pickup.location': '2dsphere' });
bookingSchema.index({ 'dropoff.location': '2dsphere' });

// Calculate fare based on distance and cab type
bookingSchema.methods.calculateFare = function() {
  const ratePerKm = {
    economy: 15,
    basic: 20,
    premium: 25
  };
  
  return this.distance * ratePerKm[this.cabType];
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 