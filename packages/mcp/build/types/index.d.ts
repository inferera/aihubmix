export interface Tool {
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
    execute: (args: any) => Promise<any>;
}
export interface Resource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    read: () => Promise<string>;
}
export interface Prompt {
    description: string;
    arguments: Array<{
        name: string;
        description: string;
        required: boolean;
    }>;
    generate: (args: any) => Promise<string>;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface FileOperation {
    type: 'read' | 'write' | 'delete';
    path: string;
    content?: string;
}
export interface Config {
    port: number;
    environment: string;
    corsOrigin: string;
    logLevel: string;
}
