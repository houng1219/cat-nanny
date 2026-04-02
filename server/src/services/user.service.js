const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError } = require('../error');

const prisma = new PrismaClient();

class UserService {
  async findAll({ role, search, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const where = { deletedAt: null };
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { cats: true, bookingsAsOwner: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        cats: {
          where: { deletedAt: null },
          select: { id: true, name: true, breed: true, gender: true },
        },
        _count: { select: { cats: true, bookingsAsOwner: true } },
      },
    });

    if (!user) throw new NotFoundError('User not found');

    return user;
  }

  async update(id, data) {
    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundError('User not found');

    const { name, phone } = data;
    return prisma.user.update({
      where: { id },
      data: { name, phone },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async getNannies() {
    return prisma.user.findMany({
      where: { role: 'NANNY', deletedAt: null },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: 'asc' },
    });
  }
}

module.exports = new UserService();
