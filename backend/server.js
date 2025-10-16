const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('node:http');
const path = require('node:path');
const socketIo = require('socket.io');
const { connectDB } = require('./config/db');
const ensureEnv = require('./config/ensureEnv');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Make app/io/server module-scoped so they can be exported
let app;
let server;
let io;

// Connect to database and start server only after DB is ready
async function startServer() {
  try {
    ensureEnv();
    await connectDB();
  } catch (err) {
    logger.error('Failed to connect to database. Exiting.', err);
    process.exit(1);
  }

  app = express();
  server = http.createServer(app);
  io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
// Security middlewares
app.use(helmet());

// Rate limiter - adjust windowMs and max for your deployment
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', apiLimiter);

// CORS - restrict to configured frontend url
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io for real-time seat locking
  io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  socket.on('lock-seat', (data) => {
    socket.broadcast.emit('seat-locked', data);
  });

  socket.on('unlock-seat', (data) => {
    socket.broadcast.emit('seat-unlocked', data);
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

// Routes
  app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Global error handler (last middleware)
  app.use((err, req, res, next) => {
  // Log full error server-side, but avoid leaking stack traces to clients in production
  logger.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : `Unhandled error: ${err?.message || err}` });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();

module.exports = { app, io };
