import mongoose from 'mongoose';
import { AppError, ValidationAppError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

function sendError(res, statusCode, code, message, extra = {}) {
  return res.status(statusCode).json({
    success: false,
    code,
    message,
    ...extra,
  });
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof ValidationAppError) {
    return sendError(res, err.statusCode, err.code, err.message, {
      ...(err.details && { details: err.details }),
    });
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'VALIDATION_ERROR', err.message, {
      details: err.errors,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 400, 'INVALID_ID', `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, 409, 'DUPLICATE_KEY', `Duplicate value for ${field}`);
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: config.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    config.env === 'development' ? err.message : 'Internal server error'
  );
}

export function notFoundHandler(_req, res) {
  return sendError(res, 404, 'NOT_FOUND', 'Route not found');
}
