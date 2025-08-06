import { z } from 'zod';
import { logger } from './logger.js';
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export const validateRequest = (schema) => {
    return async (data) => {
        try {
            return await schema.parseAsync(data);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                throw new ValidationError(error.errors[0].message);
            }
            throw error;
        }
    };
};
export const createErrorResponse = (error) => {
    logger.error(error);
    const response = {
        success: false,
        error: error.message
    };
    if (error instanceof ValidationError) {
        return { ...response, message: 'Validation failed' };
    }
    return { ...response, message: 'Internal server error' };
};
//# sourceMappingURL=validation.js.map