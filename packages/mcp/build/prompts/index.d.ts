import { Prompt } from '../types/index.js';
export declare const getPrompt: (name: string) => Prompt | undefined;
export declare const formatPrompt: (name: string, args: Record<string, any>) => Promise<string>;
