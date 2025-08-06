import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger.js';
import { Tool } from '../types/index.js';

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      logger.error('Error in function execution:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new McpError(
        ErrorCode.InternalError,
        `Operation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }) as T;
}

export function wrapTool(tool: Tool): Tool {
  return {
    ...tool,
    execute: withErrorHandling(tool.execute)
  };
} 
