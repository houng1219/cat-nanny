import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, Mail, Phone, Cat, BookOpen, Calendar } from 'lucide-react';

export function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.get(id)
      .then(res => setMember(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!member) return <div className="text-center py-12 text-gray-500">Member not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/members" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-primary-600">{member.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            <div className="mt-2 space-y-1 text-gray-600">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{member.email}</p>
              {member.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{member.phone}</p>}
              <p className="flex items-center gap-2"><Calendar className="w-4 h-4" />Joined {new Date(member.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="mt-3">
              <span className="inline-flex px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
                {member.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{member._count?.cats ?? 0}</p>
            <p className="text-sm text-gray-500">Cats</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{member._count?.bookingsAsOwner ?? 0}</p>
            <p className="text-sm text-gray-500">Bookings</p>
          </div>
        </div>
      </div>

      {member.cats?.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Cats</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {member.cats.map(cat => (
              <div key={cat.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Cat className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-sm text-gray-500">{cat.breed || 'Unknown breed'}</p>
                  </div>
                </div>
                <Link to={`/cats/${cat.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
