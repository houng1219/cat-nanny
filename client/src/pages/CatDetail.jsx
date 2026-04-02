import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { catsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, Cat, Pencil, Trash2, X, Calendar, BookOpen } from 'lucide-react';

export function CatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const fetchCat = () => {
    catsApi.get(id)
      .then(res => { setCat(res.data); setForm(res.data); })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCat(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this cat? This cannot be undone.')) return;
    try {
      await catsApi.delete(id);
      toast('Cat deleted', 'success');
      navigate('/cats');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await catsApi.update(id, form);
      toast('Cat updated', 'success');
      setShowEdit(false);
      fetchCat();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!cat) return <div className="text-center py-12 text-gray-500">Cat not found</div>;

  const canEdit = user.role === 'NANNY' || user.id === cat.owner?.id;

  return (
    <div className="space-y-6">
      <Link to="/cats" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Cats
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Cat className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cat.name}</h1>
              <div className="mt-2 space-y-1 text-gray-600">
                {cat.breed && <p>Breed: {cat.breed}</p>}
                {cat.gender && <p>Gender: {cat.gender}</p>}
                {cat.age && <p>Age: {cat.age} year{cat.age !== 1 ? 's' : ''} old</p>}
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(true)} className="btn-secondary flex items-center gap-1.5 text-sm">
                <Pencil className="w-4 h-4" />Edit
              </button>
              <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5 text-sm">
                <Trash2 className="w-4 h-4" />Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {cat.healthNotes && (
            <div className="p-4 bg-red-50 rounded-xl">
              <h3 className="font-medium text-red-700 mb-1">Health Notes</h3>
              <p className="text-sm text-red-600">{cat.healthNotes}</p>
            </div>
          )}
          {cat.specialHabits && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-medium text-blue-700 mb-1">Special Habits</h3>
              <p className="text-sm text-blue-600">{cat.specialHabits}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="font-medium text-gray-900 mb-2">Owner</h3>
          <Link to={`/members/${cat.owner?.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="font-semibold text-primary-600">{cat.owner?.name?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{cat.owner?.name}</p>
              <p className="text-sm text-gray-500">{cat.owner?.email}</p>
            </div>
          </Link>
        </div>

        {cat.bookings?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {cat.bookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{booking.service?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${booking.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-500'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit {cat.name}</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender || ''} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="label">Age (years)</label>
                  <input type="number" min="0" className="input" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Breed</label>
                <input type="text" className="input" value={form.breed || ''} onChange={e => setForm({ ...form, breed: e.target.value })} />
              </div>
              <div>
                <label className="label">Health Notes</label>
                <textarea className="input" rows={2} value={form.healthNotes || ''} onChange={e => setForm({ ...form, healthNotes: e.target.value })} />
              </div>
              <div>
                <label className="label">Special Habits</label>
                <textarea className="input" rows={2} value={form.specialHabits || ''} onChange={e => setForm({ ...form, specialHabits: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
