const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, ValidationError } = require('../error');

const prisma = new PrismaClient();

class ServiceService {
  async findAll({ nannyId, search, page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (nannyId) where.nannyId = nannyId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          nanny: { select: { id: true, name: true } },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return { services, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        nanny: { select: { id: true, name: true, email: true } },
      },
    });

    if (!service) throw new NotFoundError('Service not found');
    return service;
  }

  async create(data, nannyId) {
    if (!data.name || data.price === undefined) {
      throw new ValidationError('Service name and price are required');
    }

    const validUnits = ['PER_VISIT', 'PER_DAY'];
    if (data.unit && !validUnits.includes(data.unit)) {
      throw new ValidationError('Unit must be PER_VISIT or PER_DAY');
    }

    return prisma.service.create({
      data: {
        nannyId,
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        unit: data.unit || 'PER_VISIT',
      },
      include: {
        nanny: { select: { id: true, name: true } },
      },
    });
  }

  async update(id, data) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundError('Service not found');

    const validUnits = ['PER_VISIT', 'PER_DAY'];
    if (data.unit && !validUnits.includes(data.unit)) {
      throw new ValidationError('Unit must be PER_VISIT or PER_DAY');
    }

    return prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        unit: data.unit,
      },
      include: {
        nanny: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundError('Service not found');

    const bookings = await prisma.booking.count({
      where: { serviceId: id },
    });
    if (bookings > 0) {
      throw new ForbiddenError('Cannot delete service with existing bookings');
    }

    await prisma.service.delete({ where: { id } });
    return { deleted: true };
  }
}

module.exports = new ServiceService();
