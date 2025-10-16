import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data;
    }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Event not found</h2>
      </div>
    </div>
  );

  const event = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow overflow-hidden">
        <img src={event.img} alt={event.title} className="w-full h-72 object-cover" />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-600 mb-4">{event.location} • {format(new Date(event.date), 'PPP p')}</p>
          <p className="text-gray-700 mb-4">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="text-sm text-gray-500">Price</h4>
              <div className="text-xl font-bold">${event.price}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="text-sm text-gray-500">Available Seats</h4>
              <div className="text-xl font-bold">{event.availableSeats}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <h4 className="text-sm text-gray-500">Category</h4>
              <div className="text-xl font-bold">{event.category}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => navigate(`/booking/${event._id}`)}
              className="btn-primary px-6 py-3"
              disabled={event.availableSeats <= 0}
            >
              {event.availableSeats > 0 ? 'Book Tickets' : 'Sold Out'}
            </button>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-3 border rounded-md"
            >
              Back to events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;


