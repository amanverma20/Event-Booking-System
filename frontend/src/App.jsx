import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AdminDashboard from './pages/AdminDashboard';
import BookingFlow from './pages/BookingFlow';
import EventDetails from './pages/EventDetails';
import EventListing from './pages/EventListing';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<EventListing />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/booking/:eventId" 
                  element={
                    <ProtectedRoute>
                      <BookingFlow />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-bookings" 
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
