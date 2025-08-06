import { paintingTools } from './painting-tools.js';
import { logger } from '../utils/logger.js';
export const tools = {
    ...paintingTools
};
export const initializeTools = () => {
    logger.info('Initializing tools...');
    Object.entries(tools).forEach(([name, tool]) => {
        logger.info(`Tool initialized: ${name}`);
    });
};
//# sourceMappingURL=index.js.map