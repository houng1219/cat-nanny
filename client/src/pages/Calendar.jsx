import { useState, useEffect } from 'react';
import { bookingsApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, Cat } from 'lucide-react';

export function Calendar() {
  const toast = useToast();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    bookingsApi.calendar(year, month)
      .then(res => setBookings(res.data))
      .catch(err => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const getBookingsForDay = (day) => {
    const date = new Date(year, month - 1, day);
    return bookings.filter(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return date >= new Date(start.toDateString()) && date <= new Date(end.toDateString());
    });
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const statusColors = {
    CONFIRMED: 'bg-blue-500',
    COMPLETED: 'bg-green-500',
    PENDING: 'bg-yellow-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="btn-secondary p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold min-w-48 text-center">{monthName}</span>
          <button onClick={nextMonth} className="btn-secondary p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-3 text-center text-sm font-semibold text-gray-500 bg-gray-50">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-28 border-b border-r border-gray-100 bg-gray-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayBookings = getBookingsForDay(day);
              const isToday = today.getDate() === day && today.getMonth() + 1 === month && today.getFullYear() === year;
              return (
                <div key={day} className={`min-h-28 border-b border-r border-gray-100 p-2 ${isToday ? 'bg-primary-50' : ''}`}>
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map(b => (
                      <div
                        key={b.id}
                        className={`text-xs px-1.5 py-0.5 rounded text-white truncate ${statusColors[b.status] || 'bg-gray-500'}`}
                        title={`${b.cat?.name} - ${b.service?.name}`}
                      >
                        {b.cat?.name}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayBookings.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
