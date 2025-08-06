export declare class Cache {
    private cache;
    private maxSize;
    constructor(maxSize?: number);
    set(key: string, value: any): void;
    get(key: string): any;
    has(key: string): boolean;
    delete(key: string): void;
    clear(): void;
    size(): number;
}
export declare class FileCache extends Cache {
    getFileContent(path: string): Promise<string>;
}
