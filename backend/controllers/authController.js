const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, mobile } = req.body;
    // Decide whether to honor a requested role.
    // By default: role is ignored (public registration -> 'user').
    // Allow role when: (A) requester is an authenticated admin, or (B) env ALLOW_PUBLIC_ROLE=true (dev/testing).
    let requestedRole;
  // Allow public role selection during local development by default.
  // In production, ALLOW_PUBLIC_ROLE must be explicitly set to 'true' to allow public role assignment.
  const allowPublicRole = (process.env.NODE_ENV || 'development') !== 'production' || String(process.env.ALLOW_PUBLIC_ROLE || 'false').toLowerCase() === 'true';
    // Check admin token
    try {
      const authToken = req.header('Authorization')?.replace('Bearer ', '') || null;
      if (authToken) {
        const decodedReq = jwt.verify(authToken, process.env.JWT_SECRET || 'fallback-secret');
        const requestingUser = await User.findById(decodedReq.userId).select('role');
        if (requestingUser && requestingUser.role === 'admin' && req.body.role) {
          requestedRole = req.body.role === 'admin' ? 'admin' : 'user';
        }
      }
    } catch (err) {
      // ignore token errors — treat as unauthenticated
    }

    // If not set by admin, allow only when env flag is enabled
    if (!requestedRole && allowPublicRole && req.body.role) {
      requestedRole = req.body.role === 'admin' ? 'admin' : 'user';
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const userPayload = { name, email, password, mobile };
    if (requestedRole) userPayload.role = requestedRole;
    const user = new User(userPayload);
    await user.save();
    // If the registration is performed by an admin (requestedRole set), do not auto-login — return created user info only.
    if (requestedRole) {
      return res.status(201).json({ message: 'User created by admin', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    // Include error message in response while debugging (remove in production)
    res.status(500).json({ message: `Server error during registration: ${error.message}` });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    // Include error message in response while debugging (remove in production)
    res.status(500).json({ message: `Server error during login: ${error.message}` });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
