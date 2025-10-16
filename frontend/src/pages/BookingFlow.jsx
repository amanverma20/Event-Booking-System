import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../utils/api';

const BookingFlow = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: event, isLoading } = useQuery(['event', eventId], async () => {
    const res = await api.get(`/events/${eventId}`);
    return res.data;
  }, { enabled: !!eventId });

  const [quantity, setQuantity] = useState(1);
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onSeatLocked, onSeatUnlocked, offSeatLocked, offSeatUnlocked } = useSocket();
  const [remoteLocked, setRemoteLocked] = useState(0);

  // Listen for remote locks to adjust UI
  useEffect(() => {
    const handleLock = (data) => {
      if (data.eventId === eventId) setRemoteLocked((v) => v + 1);
    };
    const handleUnlock = (data) => {
      if (data.eventId === eventId) setRemoteLocked((v) => Math.max(0, v - 1));
    };
    onSeatLocked(handleLock);
    onSeatUnlocked(handleUnlock);
    return () => {
      offSeatLocked(handleLock);
      offSeatUnlocked(handleUnlock);
    };
  }, [eventId, onSeatLocked, onSeatUnlocked, offSeatLocked, offSeatUnlocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;
    if (quantity < 1) return toast.error('Select at least one ticket');
    if (quantity > event.availableSeats) return toast.error('Not enough seats available');
    if (!user?.email) return toast.error('You must be logged in to book');
    if (!mobile || mobile.trim().length === 0) return toast.error('Please enter a mobile number');

    setIsSubmitting(true);
    try {
      const payload = {
        eventId,
        name: user?.name || 'Guest',
        email: user?.email,
        mobile,
        quantity
      };
      await api.post('/bookings', payload);
      toast.success('Booking successful!');
      navigate('/my-bookings');
    } catch (err) {
      const serverErr = err?.response?.data;
      if (serverErr?.errors && Array.isArray(serverErr.errors)) {
        // express-validator errors
        const msgs = serverErr.errors.map(e => e.msg).join('; ');
        toast.error(msgs);
      } else {
        const message = serverErr?.message || 'Booking failed';
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Event not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Book tickets for {event.title}</h2>
        <p className="text-gray-600 mb-6">{event.location} • {new Date(event.date).toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="quantity" className="block text-sm text-gray-700 mb-1">Quantity</label>
            <input id="quantity" name="quantity" type="number" value={quantity} min={1} max={event.availableSeats} onChange={(e) => setQuantity(Number(e.target.value))} className="input-field w-32" />
            <p className="text-sm text-gray-500 mt-1">{Math.max(0, event.availableSeats - remoteLocked)} seats available</p>
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm text-gray-700 mb-1">Mobile</label>
            <input id="mobile" name="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-field w-full" />
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={isSubmitting} className="btn-primary py-2 px-4">
              {isSubmitting ? 'Processing...' : `Pay $${Number((Number(event.price) || 0) * quantity).toFixed(2)}`}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFlow;


