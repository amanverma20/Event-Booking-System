const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  img: {
    type: String,
    default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'concert', 'sports', 'exhibition', 'other'],
    default: 'other'
  },
  organizer: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ date: 1, isActive: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
