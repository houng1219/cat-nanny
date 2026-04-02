require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const config = require('./config');
const requestId = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const catsRoutes = require('./routes/cats.routes');
const servicesRoutes = require('./routes/services.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const app = express();

const isProduction = config.nodeEnv === 'production';

app.use(helmet({
  contentSecurityPolicy: isProduction,
  crossOriginEmbedderPolicy: isProduction,
}));

app.use(cors({
  origin: isProduction ? config.corsOrigin : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(requestId);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), requestId: req.id });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cats', catsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', status: 404 } });
});

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Cat Nanny API running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
