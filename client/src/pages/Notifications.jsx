import { useState, useEffect } from 'react';
import { notificationsApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

export function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    notificationsApi.list({ limit: 50 })
      .then(res => {
        setNotifications(res.data.notifications);
        setTotal(res.data.total);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      fetchNotifications();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      toast('All notifications marked as read', 'success');
      fetchNotifications();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.delete(id);
      toast('Notification deleted', 'success');
      fetchNotifications();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const typeIcons = {
    BOOKING_REQUEST: '📋',
    BOOKING_CONFIRMED: '✅',
    BOOKING_COMPLETED: '🎉',
    BOOKING_CANCELLED: '❌',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card p-4 flex items-start gap-4 ${n.isRead ? 'opacity-70' : 'bg-white border-l-4 border-l-primary-500'}`}
            >
              <div className="text-2xl flex-shrink-0">
                {typeIcons[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-gray-900">{n.title}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                {n.booking && (
                  <p className="text-xs text-gray-400 mt-1">
                    Booking: {n.booking.cat?.name} - {n.booking.status}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-2 text-gray-400 hover:text-primary-600"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
