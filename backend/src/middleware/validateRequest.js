/**
 * Request Validation Middleware
 * Validates request data using express-validator
 */

import { validationResult } from 'express-validator';
import { ErrorResponse } from './errorHandler.js';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  next();
};

export default handleValidationErrors;
