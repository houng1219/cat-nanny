const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, ValidationError, BadRequestError } = require('../error');

const prisma = new PrismaClient();

class BookingService {
  async findAll(userId, userRole, { status, nannyId, ownerId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (userRole === 'OWNER') {
      where.ownerId = userId;
    } else if (userRole === 'NANNY') {
      if (nannyId) where.nannyId = nannyId;
      if (ownerId) where.ownerId = ownerId;
    }

    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          cat: { select: { id: true, name: true, breed: true } },
          service: { select: { id: true, name: true, price: true, unit: true } },
          nanny: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id, userId, userRole) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cat: { include: { owner: { select: { id: true, name: true, email: true, phone: true } } } },
        service: true,
        nanny: { select: { id: true, name: true, email: true, phone: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
        review: true,
        notifications: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    if (userRole === 'OWNER' && booking.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this booking');
    }

    return booking;
  }

  async create(data, ownerId) {
    if (!data.catId || !data.serviceId || !data.startDate || !data.endDate) {
      throw new ValidationError('Cat, service, start date, and end date are required');
    }

    const cat = await prisma.cat.findUnique({ where: { id: data.catId, deletedAt: null } });
    if (!cat) throw new NotFoundError('Cat not found');
    if (cat.ownerId !== ownerId) throw new ForbiddenError('You can only book for your own cats');

    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new NotFoundError('Service not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate <= startDate) throw new BadRequestError('End date must be after start date');

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalFee = service.unit === 'PER_DAY' ? service.price * days : service.price;

    const booking = await prisma.booking.create({
      data: {
        nannyId: service.nannyId,
        ownerId,
        catId: data.catId,
        serviceId: data.serviceId,
        startDate,
        endDate,
        totalFee,
        notes: data.notes || null,
        status: 'PENDING',
      },
      include: {
        cat: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, price: true, unit: true } },
        nanny: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    await this.createNotification(booking.nannyId, 'BOOKING_REQUEST', 'New Booking Request', `New booking for ${booking.cat.name}`, booking.id);
    await this.createNotification(booking.ownerId, 'BOOKING_CONFIRMED', 'Booking Submitted', `Your booking for ${booking.cat.name} has been submitted`, booking.id);

    return booking;
  }

  async updateStatus(id, status, userId, userRole) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundError('Booking not found');

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    if (userRole === 'OWNER' && booking.ownerId !== userId) {
      throw new ForbiddenError('You cannot update this booking');
    }

    if (userRole === 'NANNY' && booking.nannyId !== userId && status === 'CANCELLED') {
      throw new ForbiddenError('Only the owner can cancel');
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        cat: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
        nanny: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    const statusMessages = {
      CONFIRMED: 'Booking confirmed',
      COMPLETED: 'Booking completed',
      CANCELLED: 'Booking cancelled',
    };

    await this.createNotification(booking.ownerId, `BOOKING_${status}`, statusMessages[status], `Booking for ${updated.cat.name} is ${status.toLowerCase()}`, booking.id);
    if (status === 'CONFIRMED') {
      await this.createNotification(booking.nannyId, 'BOOKING_CONFIRMED', 'Booking Confirmed', `Booking for ${updated.cat.name} confirmed`, booking.id);
    }

    return updated;
  }

  async getCalendar(nannyId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        nannyId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        OR: [
          { startDate: { gte: start, lte: end } },
          { endDate: { gte: start, lte: end } },
          { startDate: { lte: start }, endDate: { gte: end } },
        ],
      },
      include: {
        cat: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return bookings;
  }

  async createNotification(userId, type, title, message, bookingId = null) {
    return prisma.notification.create({
      data: { userId, type, title, message, bookingId },
    });
  }
}

module.exports = new BookingService();
