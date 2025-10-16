# 🎉 Smart Event Booking System

A comprehensive event booking platform built with the MERN stack, featuring real-time seat locking, beautiful animations, and a modern user interface.

![EventFlow Banner](https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)

## ✨ Features

### 🎯 Core Features
- **Event Discovery**: Browse and search events with advanced filtering
- **Real-time Booking**: Instant booking with live seat availability
- **QR Code Tickets**: Digital tickets with QR codes for easy entry
- **User Authentication**: Secure login/registration system
- **Admin Dashboard**: Complete event and booking management
- **Responsive Design**: Works perfectly on all devices
- **PWA Support**: Install as a mobile app

### 🎨 User Experience
- **Beautiful Animations**: Smooth transitions with Framer Motion
- **Modern UI**: Clean design with TailwindCSS
- **Interactive Maps**: Event location visualization
- **Confetti Celebrations**: Animated success feedback
- **Real-time Updates**: WebSocket integration for live updates

### 🔧 Technical Features
- **MERN Stack**: MongoDB, Express.js, React, Node.js
- **Vite**: Fast build tool and development server
- **Real-time Communication**: Socket.io for live updates
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with validation
- **Authentication**: JWT-based secure authentication
- **File Upload**: Image handling for events
- **Email Integration**: Booking confirmations
- **Payment Ready**: Stripe integration ready

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-event-booking-system.git
   cd smart-event-booking-system
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, backend, and frontend)
   npm run install-all
   
   # Or install separately:
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
      # Create .env file in backend directory
      cd backend
      copy .env.example .env    # on Windows (or use `cp` on macOS/Linux)

      # Edit .env with your configuration (example values)
      NODE_ENV=development
      PORT=5000
      MONGODB_URI=mongodb://localhost:27017/event-booking
      JWT_SECRET=your-super-secret-jwt-key
      FRONTEND_URL=http://localhost:5173
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Backend: npm run server
   # Frontend: npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Login: admin@eventflow.com / admin123

## 📁 Project Structure

```
smart-event-booking/
│
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Booking.js
│   │   └── User.js
│   ├── routes/
│   │   ├── eventRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── authRoutes.js
│   ├── controllers/
│   │   ├── eventController.js
│   │   ├── bookingController.js
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js
│   └── scripts/
│       └── seedData.js
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── AdminRoute.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── EventListing.jsx
│       │   ├── EventDetails.jsx
│       │   ├── BookingFlow.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── MyBookings.jsx
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   └── SocketContext.jsx
│       └── utils/
│           └── api.js
│
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events (with pagination, search, filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/stats/overview` - Get booking statistics

## 🎨 UI Components

### Pages
- **Landing Page**: Hero section with animations and features
- **Event Listing**: Search, filter, and browse events
- **Event Details**: Detailed event information with map
- **Booking Flow**: Multi-step booking process
- **My Bookings**: User's booking history
- **Admin Dashboard**: Complete admin interface

### Key Components
- **Animated Cards**: Event cards with hover effects
- **Search & Filters**: Advanced event filtering
- **QR Code Generator**: Digital ticket generation
- **Real-time Updates**: Live seat availability
- **Confetti Animation**: Success celebrations
- **Responsive Navigation**: Mobile-friendly menu

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

### Database Schema

#### Events Collection
```javascript
{
  title: String,
  description: String,
  location: String,
  date: Date,
  totalSeats: Number,
  availableSeats: Number,
  price: Number,
  img: String,
  category: String,
  organizer: String,
  tags: [String],
  isActive: Boolean
}
```

#### Bookings Collection
```javascript
{
  eventId: ObjectId,
  name: String,
  email: String,
  mobile: String,
  quantity: Number,
  totalAmount: Number,
  bookingDate: Date,
  status: String,
  paymentId: String,
  qrCode: String,
  seatNumbers: [String]
}
```

## 🚀 Deployment

### Backend (Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `frontend/dist`
4. Deploy automatically on push

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update MONGODB_URI in environment variables

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm run test:all
```

## 📱 PWA Features

- **Offline Support**: Service worker for offline functionality
- **App Installation**: Install as native app
- **Push Notifications**: Event reminders (ready for implementation)
- **Background Sync**: Sync data when online

## 🎨 Customization

### Themes
- Modify `frontend/tailwind.config.js` for color schemes
- Update CSS variables in `frontend/src/index.css`

### Animations
- Customize Framer Motion animations in components
- Add new page transitions

### Features
- Add payment integration (Stripe/PayPal)
- Implement email notifications
- Add social media sharing
- Integrate calendar apps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** for smooth animations
- **TailwindCSS** for utility-first styling
- **TanStack Query** for server state management
- **Socket.io** for real-time features
- **Vite** for fast development and building
- **Unsplash** for beautiful images

## 📞 Support

For support, email support@eventflow.com or create an issue on GitHub.

---

**Built with ❤️ for event lovers everywhere**