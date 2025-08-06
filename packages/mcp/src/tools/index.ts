import { paintingTools } from './painting-tools.js';
import { Tool } from '../types/index.js';
import { logger } from '../utils/logger.js';

export const tools: Record<string, Tool> = {
  ...paintingTools
};

export const initializeTools = () => {
  logger.info('Initializing tools...');
  Object.entries(tools).forEach(([name, tool]) => {
    logger.info(`Tool initialized: ${name}`);
  });
}; 
