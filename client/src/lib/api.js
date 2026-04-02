const API_BASE = import.meta.env.VITE_API_URL || '/api';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message || 'An error occurred';
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (token) => api.post('/auth/refresh', { refreshToken: token }),
};

// Users
export const usersApi = {
  me: () => api.get('/users/me'),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/users${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  getNannies: () => api.get('/users/nannies'),
};

// Cats
export const catsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/cats${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/cats/${id}`),
  create: (data) => api.post('/cats', data),
  update: (id, data) => api.patch(`/cats/${id}`, data),
  delete: (id) => api.delete(`/cats/${id}`),
};

// Services
export const servicesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/services${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.patch(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Bookings
export const bookingsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/bookings${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  calendar: (year, month) => api.get(`/bookings/calendar?year=${year}&month=${month}`),
};

// Reviews
export const reviewsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/reviews${qs ? `?${qs}` : ''}`);
  },
  create: (data) => api.post('/reviews', data),
  stats: (nannyId) => api.get(`/reviews/stats/${nannyId}`),
};

// Notifications
export const notificationsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/notifications${qs ? `?${qs}` : ''}`);
  },
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};
