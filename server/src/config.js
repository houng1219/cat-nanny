require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
};

module.exports = config;
