import { Tool } from '../types/index.js';
export declare function withErrorHandling<T extends (...args: any[]) => Promise<any>>(fn: T): T;
export declare function wrapTool(tool: Tool): Tool;
