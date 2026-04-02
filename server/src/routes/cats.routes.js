const express = require('express');
const catService = require('../services/cat.service');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { ownerId, search, page, limit } = req.query;
    const result = await catService.findAll(req.user.id, req.user.role, {
      ownerId,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cat = await catService.findById(req.params.id, req.user.id, req.user.role);
    res.json({ data: cat });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const cat = await catService.create(req.body, req.user.id);
    res.status(201).json({ data: cat });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const cat = await catService.update(req.params.id, req.body, req.user.id, req.user.role);
    res.json({ data: cat });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await catService.delete(req.params.id, req.user.id, req.user.role);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
