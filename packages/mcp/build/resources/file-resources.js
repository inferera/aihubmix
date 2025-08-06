import { readdir } from 'fs/promises';
import { join } from 'path';
const IGNORED_DIRS = ['node_modules', '.git', 'dist'];
export const fileResources = {};
async function listFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.includes(entry.name)) {
                const subFiles = await listFiles(fullPath);
                files.push(...subFiles);
            }
        }
        else {
            files.push(fullPath);
        }
    }
    return files;
}
//# sourceMappingURL=file-resources.js.map