const { validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Create booking validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, name, email, mobile, quantity } = req.body;

    // Use atomic update to decrement seats if available
    const qty = Number(quantity);
    const event = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: qty } },
      { $inc: { availableSeats: -qty } },
      { new: true }
    );

    if (!event) return res.status(400).json({ message: 'Event not found or insufficient seats' });

    const totalAmount = Number(event.price) * qty;

    const booking = new Booking({
      eventId,
      name,
      email,
      mobile,
      quantity: qty,
      totalAmount,
      status: 'confirmed'
    });

    const qrData = { bookingId: booking._id, eventId, name, quantity: qty, totalAmount };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    booking.qrCode = qrCode;
    await booking.save();

    await booking.populate('eventId', 'title date location');

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.user.email }).populate('eventId', 'title date location img').sort({ bookingDate: -1 }).lean();
    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Admin
const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, eventId } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (eventId) filter.eventId = eventId;

    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate('eventId', 'title date location').sort({ bookingDate: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Booking.countDocuments(filter)
    ]);

    res.json({ bookings, totalPages: Math.ceil(total / limitNum), currentPage: pageNum, total });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.email !== req.user.email && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    // Restore seats
    await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSeats: booking.quantity } });

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('eventId', 'title date location');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.email !== req.user.email && req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats/overview
// @access  Admin
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const agg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = (agg[0] && agg[0].totalRevenue) || 0;
    const bookingsByEvent = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$eventId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
      { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
      { $project: { eventTitle: '$event.title', count: 1, revenue: 1 } }
    ]);

    res.json({ totalBookings, confirmedBookings, cancelledBookings, totalRevenue, bookingsByEvent });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  cancelBooking,
  getBooking,
  getBookingStats
};
