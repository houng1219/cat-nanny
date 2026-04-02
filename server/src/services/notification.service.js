const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../error');

const prisma = new PrismaClient();

class NotificationService {
  async findAll(userId, { isRead, page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { userId };
    if (isRead !== undefined) where.isRead = isRead === 'true' || isRead === true;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            select: {
              id: true,
              status: true,
              cat: { select: { name: true } },
            },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) throw new NotFoundError('Notification not found');
    if (notification.userId !== userId) throw new NotFoundError('Notification not found');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }

  async delete(id, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) throw new NotFoundError('Notification not found');
    if (notification.userId !== userId) throw new NotFoundError('Notification not found');

    await prisma.notification.delete({ where: { id } });
    return { deleted: true };
  }
}

module.exports = new NotificationService();
