import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errors?: object[];
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error
  logger.error({
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    isOperational
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message: isOperational ? err.message : 'Internal server error',
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        errors: err.errors
      })
    },
    timestamp: new Date().toISOString()
  });
}

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: object[];

  constructor(message: string, statusCode: number = 500, errors?: object[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad request', errors?: object[]): ApiError {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string = 'Conflict'): ApiError {
    return new ApiError(message, 409);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(message, 429);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500);
  }
}
