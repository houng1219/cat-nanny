const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, ValidationError, ConflictError, BadRequestError } = require('../error');

const prisma = new PrismaClient();

class ReviewService {
  async findAll({ bookingId, nannyId, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (bookingId) where.bookingId = bookingId;
    if (nannyId) where.booking = { where: { nannyId } };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true } },
          booking: {
            include: {
              cat: { select: { id: true, name: true } },
              service: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data, ownerId) {
    if (!data.bookingId || !data.rating) {
      throw new ValidationError('Booking ID and rating are required');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.ownerId !== ownerId) throw new ForbiddenError('You can only review your own bookings');
    if (booking.status !== 'COMPLETED') throw new BadRequestError('Can only review completed bookings');

    const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
    if (existing) throw new ConflictError('Review already exists for this booking');

    return prisma.review.create({
      data: {
        bookingId: data.bookingId,
        ownerId,
        rating: parseInt(data.rating),
        comment: data.comment || null,
      },
      include: {
        owner: { select: { id: true, name: true } },
        booking: {
          include: {
            cat: { select: { id: true, name: true } },
            service: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async getNannyStats(nannyId) {
    const reviews = await prisma.review.findMany({
      where: { booking: { nannyId } },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = sum / reviews.length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { distribution[r.rating]++; });

    return { averageRating: Math.round(averageRating * 10) / 10, totalReviews: reviews.length, distribution };
  }
}

module.exports = new ReviewService();
