import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const MyBookings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings/my-bookings');
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
      <div className="text-center">Failed to load bookings</div>
    </div>
  );

  const bookings = data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-4">My Bookings ({bookings.length})</h2>
          <div className="text-sm text-gray-600">Total tickets: {bookings.reduce((s, b) => s + (b.quantity || 0), 0)}</div>
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-600">You have no bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{b.eventId?.title || 'Event'}</h3>
                    <p className="text-sm text-gray-500">{new Date(b.bookingDate).toLocaleString()}</p>
                    <p className="text-sm">Quantity: {b.quantity} • ${Number(b.totalAmount ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {b.qrCode ? (
                      <>
                        <img src={b.qrCode} alt="QR Code" className="w-28 h-28 object-cover" />
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              // convert data URL to blob and trigger download
                              const res = await fetch(b.qrCode);
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `booking-${b._id}.png`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                              toast.success('QR downloaded');
                            } catch (err) {
                              console.error('Download QR error', err);
                              toast.error('Failed to download QR');
                            }
                          }}
                          className="mt-2 px-3 py-1 bg-primary-600 text-white rounded text-sm"
                        >
                          Download QR
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No QR available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;


