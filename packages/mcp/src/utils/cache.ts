import { readFile } from 'fs/promises';
import { logger } from './logger.js';

export class Cache {
  private cache: Map<string, any>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export class FileCache extends Cache {
  async getFileContent(path: string): Promise<string> {
    if (this.has(path)) {
      return this.get(path);
    }

    try {
      const content = await readFile(path, 'utf-8');
      this.set(path, content);
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${path}`, error);
      throw error;
    }
  }
} 
