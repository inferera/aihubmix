#!/usr/bin/env node
declare class CustomMCPServer {
    private server;
    private tools;
    private resources;
    private prompts;
    constructor();
    private setupTools;
    private setupResources;
    private setupPrompts;
    private setupHandlers;
    start(): Promise<void>;
}
export { CustomMCPServer };
