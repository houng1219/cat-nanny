import { useState, useEffect } from 'react';
import { bookingsApi, catsApi, servicesApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookOpen, Plus, X, Cat } from 'lucide-react';

export function Bookings() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ catId: '', serviceId: '', startDate: '', endDate: '', notes: '' });
  const [cats, setCats] = useState([]);
  const [services, setServices] = useState([]);

  const fetchBookings = () => {
    setLoading(true);
    const params = { limit: 12, page };
    if (statusFilter) params.status = statusFilter;
    bookingsApi.list(params)
      .then(res => { setBookings(res.data.bookings); setTotal(res.data.total); })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, page]);

  const openCreate = async () => {
    try {
      const [catsRes, servicesRes] = await Promise.all([
        catsApi.list({ limit: 100 }),
        servicesApi.list({ limit: 100 }),
      ]);
      setCats(catsRes.data.cats);
      setServices(servicesRes.data.services);
      setForm({ catId: '', serviceId: '', startDate: '', endDate: '', notes: '' });
      setShowModal(true);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bookingsApi.create(form);
      toast('Booking created successfully', 'success');
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await bookingsApi.updateStatus(id, newStatus);
      toast(`Booking ${newStatus.toLowerCase()}`, 'success');
      fetchBookings();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const statusOptions = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">{total} bookings total</p>
        </div>
        {user.role === 'OWNER' && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`}
        >
          All
        </button>
        {statusOptions.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No bookings found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="card p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Cat className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.cat?.name}</h3>
                      <p className="text-sm text-gray-500">{b.service?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status} />
                    <p className="text-lg font-bold text-gray-900 mt-2">${b.totalFee}</p>
                    <p className="text-sm text-gray-500">{b.nanny?.name}</p>
                  </div>
                </div>
                {user.role === 'NANNY' && b.status === 'PENDING' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button onClick={() => handleStatusChange(b.id, 'CONFIRMED')} className="btn-primary text-sm">Confirm</button>
                    <button onClick={() => handleStatusChange(b.id, 'CANCELLED')} className="btn-danger text-sm">Cancel</button>
                  </div>
                )}
                {user.role === 'NANNY' && b.status === 'CONFIRMED' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button onClick={() => handleStatusChange(b.id, 'COMPLETED')} className="btn-primary text-sm">Mark Completed</button>
                    <button onClick={() => handleStatusChange(b.id, 'CANCELLED')} className="btn-danger text-sm">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {total > 12 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Previous</button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total / 12)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 12 >= total} className="btn-secondary">Next</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Booking</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="label">Cat *</label>
                <select className="input" value={form.catId} onChange={e => setForm({ ...form, catId: e.target.value })} required>
                  <option value="">Select a cat</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name} ({c.owner?.name})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Service *</label>
                <select className="input" value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} required>
                  <option value="">Select a service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}/{s.unit === 'PER_DAY' ? 'day' : 'visit'}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input type="date" className="input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="label">End Date *</label>
                  <input type="date" className="input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Special instructions..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
