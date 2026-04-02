const express = require('express');
const reviewService = require('../services/review.service');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { bookingId, nannyId, page, limit } = req.query;
    const result = await reviewService.findAll({
      bookingId,
      nannyId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const review = await reviewService.create(req.body, req.user.id);
    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
});

router.get('/stats/:nannyId', async (req, res, next) => {
  try {
    const stats = await reviewService.getNannyStats(req.params.nannyId);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
