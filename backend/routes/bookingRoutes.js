const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookings,
  cancelBooking,
  getBooking,
  getBookingStats
} = require('../controllers/bookingController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const bookingValidation = [
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  // Accept mobile numbers from any locale (more forgiving), or at least a reasonable digit count
  body('mobile').isMobilePhone('any').withMessage('Please provide a valid mobile number'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.post('/', auth, bookingValidation, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/stats/overview', adminAuth, getBookingStats);
router.get('/', adminAuth, getBookings);
router.get('/:id', auth, getBooking);
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;
