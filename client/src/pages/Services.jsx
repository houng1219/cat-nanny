import { useState, useEffect } from 'react';
import { servicesApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Scissors, Plus, X, Pencil, Trash2 } from 'lucide-react';

export function Services() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', unit: 'PER_VISIT' });

  const fetchServices = () => {
    setLoading(true);
    servicesApi.list({ limit: 100 })
      .then(res => setServices(res.data.services))
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setForm({ name: '', description: '', price: '', unit: 'PER_VISIT' }); setEditing(null); setShowModal(true); };
  const openEdit = (s) => { setForm(s); setEditing(s.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await servicesApi.update(editing, form);
        toast('Service updated', 'success');
      } else {
        await servicesApi.create(form);
        toast('Service created', 'success');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await servicesApi.delete(id);
      toast('Service deleted', 'success');
      fetchServices();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">{services.length} services offered</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {loading ? <LoadingSpinner /> : services.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Scissors className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No services yet. Add your first service!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <div key={s.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-gray-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{s.name}</h3>
              {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">${s.price}</span>
                <span className="text-sm text-gray-500">/ {s.unit === 'PER_DAY' ? 'day' : 'visit'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Service Name *</label>
                <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Daily Visit" required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What's included..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price *</label>
                  <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="PER_VISIT">Per Visit</option>
                    <option value="PER_DAY">Per Day</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
