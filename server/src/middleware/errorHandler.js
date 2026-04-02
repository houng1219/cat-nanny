const { AppError } = require('../error');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        status: err.status,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  console.error(`[${req.id}] Unhandled error:`, err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
      status: 500,
    },
  });
}

module.exports = errorHandler;
