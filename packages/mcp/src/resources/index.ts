import { fileResources } from './file-resources.js';
import { logger } from '../utils/logger.js';
import { Resource } from '../types/index.js';

export const resources: Resource[] = [];

export const initializeResources = () => {
  logger.info('Initializing resources...');
  Object.entries(fileResources).forEach(([name, resource]) => {
    resources.push(resource);
  });
  logger.info(`Resources initialized: ${resources.length} resources loaded`);
}; 
