const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories
} = require('../controllers/eventController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const eventValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('organizer').trim().isLength({ min: 2 }).withMessage('Organizer name must be at least 2 characters')
];

const updateEventValidation = [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('totalSeats').optional().isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// Routes
router.get('/', getEvents);
router.get('/categories/list', getCategories);
router.get('/:id', getEvent);
router.post('/', adminAuth, eventValidation, createEvent);
router.put('/:id', adminAuth, updateEventValidation, updateEvent);
router.delete('/:id', adminAuth, deleteEvent);

module.exports = router;
