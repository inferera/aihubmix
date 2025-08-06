import { z } from 'zod';
import { ApiResponse } from '../types/index.js';
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare const validateRequest: (schema: z.ZodSchema) => (data: unknown) => Promise<any>;
export declare const createErrorResponse: (error: Error) => ApiResponse;
