const express = require('express');
const userService = require('../services/user.service');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', requireRole('NANNY'), async (req, res, next) => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await userService.findAll({ role, search, page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.get('/nannies', async (req, res, next) => {
  try {
    const nannies = await userService.getNannies();
    res.json({ data: nannies });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'NANNY') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Cannot update other users', status: 403 } });
    }
    const user = await userService.update(req.params.id, req.body);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
