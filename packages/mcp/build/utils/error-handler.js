import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger.js';
export function withErrorHandling(fn) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            if (error instanceof McpError) {
                throw error;
            }
            logger.error('Error in function execution:', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new McpError(ErrorCode.InternalError, `Operation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
export function wrapTool(tool) {
    return {
        ...tool,
        execute: withErrorHandling(tool.execute)
    };
}
//# sourceMappingURL=error-handler.js.map