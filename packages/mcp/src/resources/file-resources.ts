// src/resources/file-resources.ts
import { Resource } from '../types/index.js';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const IGNORED_DIRS = ['node_modules', '.git', 'dist'];

export const fileResources: Record<string, Resource> = {};

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.includes(entry.name)) {
        const subFiles = await listFiles(fullPath);
        files.push(...subFiles);
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

