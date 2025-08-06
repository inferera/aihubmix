import { z } from 'zod';
import { logger } from './logger.js';
import { ApiResponse } from '../types/index.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateRequest = (schema: z.ZodSchema) => {
  return async (data: unknown) => {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }
  };
};

export const createErrorResponse = (error: Error): ApiResponse => {
  logger.error(error);

  const response: ApiResponse = {
    success: false,
    error: error.message
  };

  if (error instanceof ValidationError) {
    return { ...response, message: 'Validation failed' };
  }

  return { ...response, message: 'Internal server error' };
}; 
