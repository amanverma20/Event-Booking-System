const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@eventflow.com',
      password: 'admin123',
      role: 'admin',
      mobile: '+1234567890'
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Create regular users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        mobile: '+1234567891'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        mobile: '+1234567892'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        mobile: '+1234567893'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log('👥 Created regular users');

    // Create events
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Join us for the biggest tech conference of the year! Learn about the latest trends in AI, blockchain, and cloud computing from industry experts.',
        location: 'San Francisco Convention Center, San Francisco, CA',
        date: new Date('2024-03-15T09:00:00Z'),
        totalSeats: 500,
        availableSeats: 450,
        price: 299.99,
        organizer: 'Tech Events Inc.',
        category: 'conference',
        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        tags: ['technology', 'AI', 'blockchain', 'cloud computing']
      },
      {
        title: 'React Workshop',
        description: 'Master React.js with hands-on workshops and real-world projects. Perfect for developers looking to level up their frontend skills.',
        location: 'Online Event',
        date: new Date('2024-02-20T14:00:00Z'),
        totalSeats: 100,
        availableSeats: 75,
        price: 149.99,
        organizer: 'Code Academy',
        category: 'workshop',
        img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        tags: ['react', 'javascript', 'frontend', 'web development']
      },
      {
        title: 'Summer Music Festival',
        description: 'Experience the ultimate summer music festival with top artists from around the world. Three days of amazing music, food, and fun!',
        location: 'Central Park, New York, NY',
        date: new Date('2024-07-15T18:00:00Z'),
        totalSeats: 10000,
        availableSeats: 8500,
        price: 199.99,
        organizer: 'Music Festivals LLC',
        category: 'concert',
        img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        tags: ['music', 'festival', 'summer', 'entertainment']
      },
      {
        title: 'Startup Pitch Competition',
        description: 'Watch innovative startups pitch their ideas to a panel of investors. Network with entrepreneurs and discover the next big thing!',
        location: 'Silicon Valley Innovation Center, Palo Alto, CA',
        date: new Date('2024-04-10T10:00:00Z'),
        totalSeats: 200,
        availableSeats: 150,
        price: 99.99,
        organizer: 'Startup Hub',
        category: 'conference',
        img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        tags: ['startup', 'pitch', 'investment', 'entrepreneurship']
      },
      {
        title: 'Digital Marketing Masterclass',
        description: 'Learn advanced digital marketing strategies from industry experts. SEO, social media, content marketing, and more!',
        location: 'Marketing Institute, Los Angeles, CA',
        date: new Date('2024-03-25T09:30:00Z'),
        totalSeats: 150,
        availableSeats: 120,
        price: 179.99,
        organizer: 'Marketing Pro Academy',
        category: 'workshop',
        img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80',
        tags: ['marketing', 'digital', 'SEO', 'social media']
      },
      {
        title: 'Art Exhibition: Modern Masters',
        description: 'Explore contemporary art from renowned artists around the world. A curated collection of paintings, sculptures, and digital art.',
        location: 'Modern Art Museum, Chicago, IL',
        date: new Date('2024-05-05T11:00:00Z'),
        totalSeats: 300,
        availableSeats: 250,
        price: 49.99,
        organizer: 'Art Gallery Network',
        category: 'exhibition',
        img: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
        tags: ['art', 'exhibition', 'contemporary', 'culture']
      },
      {
        title: 'Marathon Run 2024',
        description: 'Join thousands of runners for the annual city marathon. Choose from 5K, 10K, half marathon, or full marathon distances.',
        location: 'City Center, Boston, MA',
        date: new Date('2024-06-08T07:00:00Z'),
        totalSeats: 5000,
        availableSeats: 4200,
        price: 79.99,
        organizer: 'Sports Events Corp',
        category: 'sports',
        img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        tags: ['marathon', 'running', 'fitness', 'sports']
      },
      {
        title: 'Blockchain & Crypto Summit',
        description: 'Discover the future of blockchain technology and cryptocurrency. Expert panels, networking, and the latest industry insights.',
        location: 'Convention Center, Miami, FL',
        date: new Date('2024-08-20T09:00:00Z'),
        totalSeats: 800,
        availableSeats: 650,
        price: 399.99,
        organizer: 'Crypto Events Global',
        category: 'conference',
        img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2036&q=80',
        tags: ['blockchain', 'cryptocurrency', 'fintech', 'technology']
      }
    ];

    const createdEvents = [];
    for (const eventData of events) {
      const event = new Event(eventData);
      await event.save();
      createdEvents.push(event);
    }
    console.log('🎉 Created events');

    // Create sample bookings
    const bookings = [
      {
        eventId: createdEvents[0]._id,
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '+1234567891',
        quantity: 2,
        totalAmount: 599.98,
        bookingDate: new Date('2024-01-15T10:00:00Z'),
        status: 'confirmed'
      },
      {
        eventId: createdEvents[1]._id,
        name: 'Jane Smith',
        email: 'jane@example.com',
        mobile: '+1234567892',
        quantity: 1,
        totalAmount: 149.99,
        bookingDate: new Date('2024-01-20T14:30:00Z'),
        status: 'confirmed'
      },
      {
        eventId: createdEvents[2]._id,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        mobile: '+1234567893',
        quantity: 3,
        totalAmount: 599.97,
        bookingDate: new Date('2024-01-25T16:45:00Z'),
        status: 'confirmed'
      },
      {
        eventId: createdEvents[0]._id,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        mobile: '+1234567894',
        quantity: 1,
        totalAmount: 299.99,
        bookingDate: new Date('2024-01-30T11:20:00Z'),
        status: 'cancelled'
      }
    ];

    for (const bookingData of bookings) {
      const booking = new Booking(bookingData);
      await booking.save();
    }
    console.log('🎫 Created sample bookings');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👤 Users: ${await User.countDocuments()}`);
    console.log(`🎉 Events: ${await Event.countDocuments()}`);
    console.log(`🎫 Bookings: ${await Booking.countDocuments()}`);
    console.log('\n🔑 Admin Login:');
    console.log('Email: admin@eventflow.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
seedData();
