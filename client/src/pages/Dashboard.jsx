import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingsApi, catsApi, usersApi } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CalendarDays, Cat, Users, BookOpen, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user.role === 'NANNY') {
          const [bookingsRes, catsRes, usersRes] = await Promise.all([
            bookingsApi.list({ limit: 5 }),
            catsApi.list({ limit: 5 }),
            usersApi.list({ role: 'OWNER', limit: 5 }),
          ]);
          setStats({
            totalBookings: bookingsRes.data.total,
            pendingBookings: (await bookingsApi.list({ status: 'PENDING' })).data.total,
            totalCats: catsRes.data.total,
            totalOwners: usersRes.data.total,
          });
          setRecentBookings(bookingsRes.data.bookings);
        } else {
          const [bookingsRes, catsRes] = await Promise.all([
            bookingsApi.list({ limit: 5 }),
            catsApi.list({ limit: 5 }),
          ]);
          setStats({
            totalBookings: bookingsRes.data.total,
            pendingBookings: (await bookingsApi.list({ status: 'PENDING' })).data.total,
            totalCats: catsRes.data.total,
          });
          setRecentBookings(bookingsRes.data.bookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.role]);

  if (loading) return <LoadingSpinner />;

  const statCards = user.role === 'NANNY'
    ? [
        { label: 'Total Bookings', value: stats?.totalBookings ?? 0, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'Pending', value: stats?.pendingBookings ?? 0, icon: CalendarDays, color: 'bg-yellow-500' },
        { label: 'Total Cats', value: stats?.totalCats ?? 0, icon: Cat, color: 'bg-purple-500' },
        { label: 'Owners', value: stats?.totalOwners ?? 0, icon: Users, color: 'bg-green-500' },
      ]
    : [
        { label: 'My Bookings', value: stats?.totalBookings ?? 0, icon: BookOpen, color: 'bg-blue-500' },
        { label: 'Pending', value: stats?.pendingBookings ?? 0, icon: CalendarDays, color: 'bg-yellow-500' },
        { label: 'My Cats', value: stats?.totalCats ?? 0, icon: Cat, color: 'bg-purple-500' },
      ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <p className="text-gray-600 mt-1">
          {user.role === 'NANNY' ? "Here's an overview of your cat sitting business" : "Here's your cat care overview"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-xl`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No bookings yet</p>
            </div>
          ) : (
            recentBookings.map(booking => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Cat className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.cat?.name}</p>
                    <p className="text-sm text-gray-500">{booking.service?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.status} />
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
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
