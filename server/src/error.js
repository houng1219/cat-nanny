class AppError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'AppError';
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super('BAD_REQUEST', message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super('CONFLICT', message, 409);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error', details = null) {
    super('VALIDATION_ERROR', message, 422);
    this.details = details;
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
