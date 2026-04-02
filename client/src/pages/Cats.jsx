import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Cat, Plus, X, ChevronDown } from 'lucide-react';

export function Cats() {
  const { user } = useAuth();
  const toast = useToast();
  const [cats, setCats] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({ name: '', gender: '', breed: '', age: '', healthNotes: '', specialHabits: '' });
  const [saving, setSaving] = useState(false);

  const fetchCats = () => {
    setLoading(true);
    catsApi.list({ search: search || undefined, page, limit: 12 })
      .then(res => { setCats(res.data.cats); setTotal(res.data.total); })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCats(); }, [search, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await catsApi.create(form);
      toast('Cat added successfully', 'success');
      setShowModal(false);
      setForm({ name: '', gender: '', breed: '', age: '', healthNotes: '', specialHabits: '' });
      fetchCats();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cats</h1>
          <p className="text-gray-600 mt-1">{total} cats registered</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Cat
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search cats by name or breed..."
          className="input pl-10"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : cats.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Cat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No cats found</p>
          {user.role === 'OWNER' && (
            <button onClick={() => setShowModal(true)} className="mt-4 text-primary-600 hover:text-primary-700 font-medium">
              Add your first cat
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cats.map(cat => (
              <Link key={cat.id} to={`/cats/${cat.id}`} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Cat className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.breed || 'Unknown breed'}</p>
                    <p className="text-sm text-gray-500 capitalize">{cat.gender || 'Unknown gender'}</p>
                    <p className="text-sm text-gray-400 mt-1">Owner: {cat.owner?.name}</p>
                  </div>
                </div>
                {cat.age && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{cat.age} year{cat.age !== 1 ? 's' : ''} old</span>
                  </div>
                )}
              </Link>
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New Cat</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="label">Age (years)</label>
                  <input type="number" min="0" className="input" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Breed</label>
                <input type="text" className="input" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Persian, Siamese" />
              </div>
              <div>
                <label className="label">Health Notes</label>
                <textarea className="input" rows={2} value={form.healthNotes} onChange={e => setForm({ ...form, healthNotes: e.target.value })} placeholder="Any health conditions..." />
              </div>
              <div>
                <label className="label">Special Habits</label>
                <textarea className="input" rows={2} value={form.specialHabits} onChange={e => setForm({ ...form, specialHabits: e.target.value })} placeholder="Likes, dislikes, quirks..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Add Cat'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
