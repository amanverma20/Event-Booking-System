const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  paymentId: {
    type: String,
    default: null
  },
  qrCode: {
    type: String,
    default: null
  },
  seatNumbers: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ eventId: 1, status: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ bookingDate: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
