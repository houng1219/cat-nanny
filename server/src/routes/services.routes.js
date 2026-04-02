const express = require('express');
const serviceService = require('../services/service.service');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { nannyId, search, page, limit } = req.query;
    const result = await serviceService.findAll({
      nannyId: req.user.role === 'NANNY' ? (nannyId || req.user.id) : nannyId,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const service = await serviceService.findById(req.params.id);
    res.json({ data: service });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('NANNY'), async (req, res, next) => {
  try {
    const service = await serviceService.create(req.body, req.user.id);
    res.status(201).json({ data: service });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireRole('NANNY'), async (req, res, next) => {
  try {
    const service = await serviceService.update(req.params.id, req.body);
    res.json({ data: service });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('NANNY'), async (req, res, next) => {
  try {
    const result = await serviceService.delete(req.params.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
