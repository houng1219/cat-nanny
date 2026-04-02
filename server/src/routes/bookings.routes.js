const express = require('express');
const bookingService = require('../services/booking.service');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { status, nannyId, ownerId, page, limit } = req.query;
    const result = await bookingService.findAll(req.user.id, req.user.role, {
      status,
      nannyId,
      ownerId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/calendar', async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Year and month are required', status: 400 } });
    }
    const bookings = await bookingService.getCalendar(req.user.id, parseInt(year), parseInt(month));
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const booking = await bookingService.findById(req.params.id, req.user.id, req.user.role);
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.body, req.user.id);
    res.status(201).json({ data: booking });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await bookingService.updateStatus(req.params.id, status, req.user.id, req.user.role);
    res.json({ data: booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
