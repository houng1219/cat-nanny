import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../lib/api';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Cat,
  Scissors,
  CalendarDays,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  PawPrint,
} from 'lucide-react';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationsApi.list({ isRead: false }).then(res => {
        setUnreadCount(res.data.unreadCount || 0);
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { path: '/members', label: 'Members', icon: Users, show: user?.role === 'NANNY' },
    { path: '/cats', label: 'Cats', icon: Cat, show: true },
    { path: '/services', label: 'Services', icon: Scissors, show: user?.role === 'NANNY' },
    { path: '/bookings', label: 'Bookings', icon: BookOpen, show: true },
    { path: '/calendar', label: 'Calendar', icon: CalendarDays, show: user?.role === 'NANNY' },
    { path: '/notifications', label: 'Notifications', icon: Bell, show: true, badge: unreadCount },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
                <PawPrint className="w-7 h-7" />
                <span>Cat Nanny</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{user?.name}</span>
                <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{user?.role}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 text-sm">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-2 px-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
