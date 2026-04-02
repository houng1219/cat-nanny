const express = require('express');
const notificationService = require('../services/notification.service');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { isRead, page, limit } = req.query;
    const result = await notificationService.findAll(req.user.id, {
      isRead,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await notificationService.delete(req.params.id, req.user.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
