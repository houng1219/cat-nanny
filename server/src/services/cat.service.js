const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, ValidationError } = require('../error');

const prisma = new PrismaClient();

class CatService {
  async findAll(userId, userRole, { ownerId, search, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };

    if (userRole === 'OWNER') {
      where.ownerId = userId;
    } else if (ownerId) {
      where.ownerId = ownerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { breed: { contains: search } },
      ];
    }

    const [cats, total] = await Promise.all([
      prisma.cat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { bookings: true } },
        },
      }),
      prisma.cat.count({ where }),
    ]);

    return { cats, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id, userId, userRole) {
    const cat = await prisma.cat.findUnique({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        bookings: {
          where: { status: 'COMPLETED' },
          orderBy: { startDate: 'desc' },
          take: 5,
          include: {
            service: { select: { name: true, price: true } },
          },
        },
      },
    });

    if (!cat) throw new NotFoundError('Cat not found');

    if (userRole === 'OWNER' && cat.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this cat');
    }

    return cat;
  }

  async create(data, ownerId) {
    if (!data.name) throw new ValidationError('Cat name is required');

    return prisma.cat.create({
      data: {
        name: data.name,
        ownerId,
        gender: data.gender || null,
        breed: data.breed || null,
        age: data.age ? parseInt(data.age) : null,
        healthNotes: data.healthNotes || null,
        specialHabits: data.specialHabits || null,
        photoUrl: data.photoUrl || null,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id, data, userId, userRole) {
    const cat = await prisma.cat.findUnique({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundError('Cat not found');

    if (userRole === 'OWNER' && cat.ownerId !== userId) {
      throw new ForbiddenError('You cannot update this cat');
    }

    return prisma.cat.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        breed: data.breed,
        age: data.age ? parseInt(data.age) : undefined,
        healthNotes: data.healthNotes,
        specialHabits: data.specialHabits,
        photoUrl: data.photoUrl,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id, userId, userRole) {
    const cat = await prisma.cat.findUnique({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundError('Cat not found');

    if (userRole === 'OWNER' && cat.ownerId !== userId) {
      throw new ForbiddenError('You cannot delete this cat');
    }

    await prisma.cat.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { deleted: true };
  }
}

module.exports = new CatService();
