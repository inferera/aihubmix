declare module "@musistudio/llms" {
  import { FastifyInstance } from "fastify";

  export default class Server {
    constructor(config: any);
    app: FastifyInstance;
    register(plugin: any, options?: any): void;
    get(path: string, handler: (request: any, reply: any) => Promise<any>): void;
    post(path: string, handler: (request: any, reply: any) => Promise<any>): void;
    addHook(event: string, handler: (request: any, reply: any, done?: () => void) => void): void;
    start(): Promise<void>;
  }
}

declare module "tiktoken" {
  export function get_encoding(encoding: string): {
    encode: (text: string) => Uint8Array;
    decode: (tokens: Uint8Array) => string;
  };
}

declare module "json5" {
  export function parse(text: string, reviver?: (key: string, value: any) => any): any;
  export function stringify(value: any, replacer?: (key: string, value: any) => any, space?: string | number): string;
  export default {
    parse,
    stringify
  };
} 
