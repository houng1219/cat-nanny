const express = require('express');
const authService = require('../services/auth.service');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone, role } = req.body;
    const result = await authService.register({ email, password, name, phone, role });
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Refresh token required', status: 400 } });
    }
    const tokens = await authService.refreshToken(refreshToken);
    res.json({ data: tokens });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
