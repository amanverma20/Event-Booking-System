import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const AdminDashboard = () => {
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const res = await api.get('/bookings/stats/overview');
      return res.data;
    }
  });

  const { data: events } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const res = await api.get('/events?limit=50');
      return res.data?.events || [];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data || [];
    }
  });

  const updateRole = useMutation(async ({ id, role }) => {
    const res = await api.put(`/admin/users/${id}/role`, { role });
    return res.data;
  }, {
    onSuccess: () => {
      toast.success('User role updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => {
      const serverErr = err?.response?.data;
      if (serverErr?.errors && Array.isArray(serverErr.errors)) {
        toast.error(serverErr.errors.map(e => e.msg).join('; '));
      } else {
        toast.error(serverErr?.message || 'Update role failed');
      }
    }
  });

  const createEventMutation = useMutation(async (payload) => {
    const res = await api.post('/events', payload);
    return res.data;
  }, {
    onSuccess: () => {
      toast.success('Event created');
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err) => {
      const serverErr = err?.response?.data;
      if (serverErr?.errors && Array.isArray(serverErr.errors)) {
        toast.error(serverErr.errors.map(e => e.msg).join('; '));
      } else {
        toast.error(serverErr?.message || 'Create event failed');
      }
    }
  });

  // Update event
  const updateEventMutation = useMutation(async ({ id, payload }) => {
    const res = await api.put(`/events/${id}`, payload);
    return res.data;
  }, {
    onSuccess: () => {
      toast.success('Event updated');
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err) => {
      const serverErr = err?.response?.data;
      toast.error(serverErr?.message || 'Update failed');
    }
  });

  // Delete event
  const deleteEventMutation = useMutation(async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  }, {
    onSuccess: () => {
      toast.success('Event deleted');
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (err) => {
      const serverErr = err?.response?.data;
      toast.error(serverErr?.message || 'Delete failed');
    }
  });

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      title: form.title.value,
      description: form.description.value,
      location: form.location.value,
      // normalize date to ISO string and coerce numerics
      date: new Date(form.date.value).toISOString(),
      totalSeats: Math.max(1, parseInt(form.totalSeats.value, 1) || 0),
      price: Number(Number(form.price.value || 0).toFixed(2)),
      organizer: form.organizer.value,
      category: form.category.value,
      img: form.img.value || undefined
    };
    createEventMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Booking Overview</h2>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Total bookings</div>
                <div className="text-xl font-bold">{stats.totalBookings}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Confirmed</div>
                <div className="text-xl font-bold">{stats.confirmedBookings}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Cancelled</div>
                <div className="text-xl font-bold">{stats.cancelledBookings}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">Revenue</div>
                <div className="text-xl font-bold">${stats.totalRevenue}</div>
              </div>
            </div>
          ) : (
            <div>Loading stats...</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Create Event</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" placeholder="Title" className="input-field" required />
            <input name="location" placeholder="Location" className="input-field" required />
            <input name="date" type="datetime-local" className="input-field" required />
            <input name="totalSeats" type="number" placeholder="Total seats" className="input-field" required />
            <input name="price" type="number" step="0.01" placeholder="Price" className="input-field" required />
            <input name="organizer" placeholder="Organizer" className="input-field" required />
            <select name="category" className="input-field">
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="concert">Concert</option>
              <option value="sports">Sports</option>
              <option value="exhibition">Exhibition</option>
              <option value="other">Other</option>
            </select>
            <input name="img" placeholder="Image URL" className="input-field" />
            <div className="md:col-span-2">
              <textarea name="description" placeholder="Description" className="input-field h-28" required />
              <div className="mt-4">
                <button type="submit" className="btn-primary">Create Event</button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Events</h2>
          <div className="space-y-3">
            {(events || []).map((e) => (
              <div key={e._id} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-sm text-gray-500">{e.location} • {new Date(e.date).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">{e.availableSeats} seats</div>
                    <button onClick={() => {
                      setEditingId(e._id);
                      setEditValues({
                        title: e.title || '',
                        location: e.location || '',
                        date: e.date ? new Date(e.date).toISOString().slice(0,16) : '',
                        totalSeats: e.totalSeats || 0,
                        price: e.price || 0,
                        organizer: e.organizer || '',
                        category: e.category || 'other',
                        img: e.img || '',
                        description: e.description || ''
                      });
                    }} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                    <button onClick={() => {
                      if (confirm('Delete this event? This is irreversible.')) deleteEventMutation.mutate(e._id);
                    }} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>

                {editingId === e._id && (
                  <form className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={(ev) => {
                    ev.preventDefault();
                    const payload = {
                      title: editValues.title,
                      description: editValues.description,
                      location: editValues.location,
                      date: new Date(editValues.date).toISOString(),
                      totalSeats: Math.max(1, Number(editValues.totalSeats) || 0),
                      availableSeats: Math.max(0, Number(editValues.totalSeats) || 0),
                      price: Number(Number(editValues.price || 0).toFixed(2)),
                      organizer: editValues.organizer,
                      category: editValues.category,
                      img: editValues.img || undefined
                    };
                    updateEventMutation.mutate({ id: e._id, payload });
                    setEditingId(null);
                  }}>
                    <input value={editValues.title} onChange={(ev) => setEditValues(v => ({...v, title: ev.target.value}))} className="input-field" />
                    <input value={editValues.location} onChange={(ev) => setEditValues(v => ({...v, location: ev.target.value}))} className="input-field" />
                    <input type="datetime-local" value={editValues.date} onChange={(ev) => setEditValues(v => ({...v, date: ev.target.value}))} className="input-field" />
                    <input type="number" value={editValues.totalSeats} onChange={(ev) => setEditValues(v => ({...v, totalSeats: ev.target.value}))} className="input-field" />
                    <input type="number" step="0.01" value={editValues.price} onChange={(ev) => setEditValues(v => ({...v, price: ev.target.value}))} className="input-field" />
                    <input value={editValues.organizer} onChange={(ev) => setEditValues(v => ({...v, organizer: ev.target.value}))} className="input-field" />
                    <select value={editValues.category} onChange={(ev) => setEditValues(v => ({...v, category: ev.target.value}))} className="input-field">
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="concert">Concert</option>
                      <option value="sports">Sports</option>
                      <option value="exhibition">Exhibition</option>
                      <option value="other">Other</option>
                    </select>
                    <input value={editValues.img} onChange={(ev) => setEditValues(v => ({...v, img: ev.target.value}))} className="input-field" />
                    <textarea value={editValues.description} onChange={(ev) => setEditValues(v => ({...v, description: ev.target.value}))} className="input-field h-24 md:col-span-2" />
                    <div className="md:col-span-2 flex gap-2">
                      <button type="submit" className="btn-primary">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 border rounded">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="space-y-3">
            {(users || []).map((u) => (
              <div key={u._id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold">{u.name} <span className="text-sm text-gray-500">({u.email})</span></div>
                  <div className="text-sm text-gray-500">{u.mobile}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded bg-gray-100 text-sm">{u.role}</div>
                  {u.role === 'admin' ? (
                    <button onClick={() => updateRole.mutate({ id: u._id, role: 'user' })} className="px-3 py-1 bg-yellow-500 text-white rounded">Demote</button>
                  ) : (
                    <button onClick={() => updateRole.mutate({ id: u._id, role: 'admin' })} className="px-3 py-1 bg-primary-600 text-white rounded">Promote</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


