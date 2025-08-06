import { readFile } from 'fs/promises';
import { logger } from './logger.js';
export class Cache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
    get(key) {
        return this.cache.get(key);
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
export class FileCache extends Cache {
    async getFileContent(path) {
        if (this.has(path)) {
            return this.get(path);
        }
        try {
            const content = await readFile(path, 'utf-8');
            this.set(path, content);
            return content;
        }
        catch (error) {
            logger.error(`Failed to read file: ${path}`, error);
            throw error;
        }
    }
}
//# sourceMappingURL=cache.js.map