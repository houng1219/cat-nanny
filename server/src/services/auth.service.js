const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const { UnauthorizedError, ConflictError, ValidationError } = require('../error');

const prisma = new PrismaClient();

class AuthService {
  async register({ email, password, name, phone, role }) {
    const validRoles = ['OWNER', 'NANNY'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid role. Must be OWNER or NANNY');
    }

    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone: phone || null, role },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });

    const tokens = this.generateTokens(user);

    return { user, ...tokens };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };

    const tokens = this.generateTokens(safeUser);

    return { user: safeUser, ...tokens };
  }

  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(token) {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      };

      return this.generateTokens(safeUser);
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}

module.exports = new AuthService();
