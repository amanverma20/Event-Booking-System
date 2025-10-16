const { validationResult } = require('express-validator');
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    // Debug: log incoming query params to help diagnose client errors
    console.debug('GET /api/events query:', req.query);
    // Coerce and sanitize query params
    let { page = 1, limit = 10, category, search, sortBy = 'date' } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const query = { isActive: true };
    if (category && category !== 'all') query.category = category;

    // Build text search safely — invalid regex should not crash the endpoint
    if (search) {
      try {
        const re = new RegExp(search, 'i');
        query.$or = [
          { title: { $regex: re } },
          { description: { $regex: re } },
          { location: { $regex: re } }
        ];
      } catch (e) {
          const logger = require('../utils/logger');
          logger.warn('Invalid search regex, ignoring search param:', search);
      }
    }

    // Sanitize sort option
    const sort = {};
    if (sortBy) {
      if (typeof sortBy === 'string' && sortBy.startsWith('-')) sort[sortBy.slice(1)] = -1;
      else if (typeof sortBy === 'string') sort[sortBy] = 1;
    }

    const [events, total] = await Promise.all([
      Event.find(query).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Event.countDocuments(query)
    ]);

    res.json({ events, totalPages: Math.max(1, Math.ceil(total / limitNum)), currentPage: pageNum, total });
  } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Admin
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = new Event({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      date: req.body.date,
      totalSeats: req.body.totalSeats,
      availableSeats: req.body.totalSeats,
      price: req.body.price,
      img: req.body.img || undefined,
      category: req.body.category || 'other',
      organizer: req.body.organizer
    });
    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Admin
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (req.body.totalSeats && req.body.totalSeats !== event.totalSeats) {
      const seatDifference = req.body.totalSeats - event.totalSeats;
      req.body.availableSeats = Math.max(0, event.availableSeats + seatDifference);
    }

    const bodyKeys = Object.keys(req.body || {});
    for (const k of bodyKeys) {
      if (k in event.toObject()) {
        event[k] = req.body[k];
      }
    }
    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get event categories
// @route   GET /api/events/categories/list
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.json(categories.filter(Boolean));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories
};
