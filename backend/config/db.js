const mongoose = require('mongoose');

/**
 * connectDB - establishes a mongoose connection using environment variable
 * MONGODB_URI (or MONGO_URI). Exports the mongoose instance.
 *
 * Behavior:
 * - Retries a few times with exponential backoff on failure.
 * - Throws an error if unable to connect after retries.
 */
let _mongoose;

async function connectDB(options = {}) {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/event-booking';
  const maxRetries = Number(options.maxRetries ?? 5);
  const baseDelay = Number(options.retryDelay ?? 2000); // ms

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Add more mongoose options here if required (poolSize deprecated in v6)
  };

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      await mongoose.connect(uri, mongooseOpts);
      _mongoose = mongoose;
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      console.log('MongoDB connected');
      return mongoose;
    } catch (err) {
      attempt += 1;
      console.error(`MongoDB connection attempt ${attempt} failed:`, err.message || err);
      if (attempt > maxRetries) {
        console.error('Exceeded max MongoDB connection attempts');
        throw err;
      }
      // exponential backoff
      const delay = baseDelay * attempt;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

function getMongoose() {
  if (!_mongoose) throw new Error('Mongoose not initialized. Call connectDB() first.');
  return _mongoose;
}

module.exports = { connectDB, getMongoose };
