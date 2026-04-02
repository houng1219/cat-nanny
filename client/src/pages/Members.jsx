import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Users as UsersIcon, Cat, BookOpen } from 'lucide-react';

export function Members() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('OWNER');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res = await usersApi.list({ role, search: search || undefined, page, limit: 12 });
        setMembers(res.data.users);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [role, search, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">{total} {role.toLowerCase()}s registered</p>
        </div>
        <div className="flex gap-2">
          {['OWNER', 'NANNY'].map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                role === r ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {r === 'OWNER' ? 'Cat Owners' : 'Nannies'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className="input pl-10"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : members.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No members found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
              <Link key={member.id} to={`/members/${member.id}`} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-primary-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Cat className="w-3 h-3" />
                        {member._count?.cats ?? 0} cats
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {member._count?.bookingsAsOwner ?? 0} bookings
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {total > 12 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 12 >= total} className="btn-secondary">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
