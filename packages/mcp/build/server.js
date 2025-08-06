#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { paintingTools } from './tools/painting-tools.js';
import { fileResources } from './resources/file-resources.js';
import { commonPrompts } from './prompts/common-prompts.js';
import { tools, initializeTools } from './tools/index.js';
import { logger } from './utils/logger.js';
class CustomMCPServer {
    constructor() {
        this.server = new Server({
            name: 'aihubmix-mcp',
            version: '1.0.0',
            capabilities: {
                tools: {},
                resources: {},
                prompts: {}
            }
        });
        this.tools = new Map();
        this.resources = new Map();
        this.prompts = new Map();
        this.setupTools();
        this.setupResources();
        this.setupPrompts();
        this.setupHandlers();
        // Error handling
        this.server.onerror = (error) => logger.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupTools() {
        // 注册 Ideogram 工具
        Object.entries(paintingTools).forEach(([name, tool]) => {
            this.tools.set(name, tool);
        });
    }
    setupResources() {
        Object.entries(fileResources).forEach(([name, resource]) => {
            this.resources.set(name, resource);
        });
    }
    setupPrompts() {
        Object.entries(commonPrompts).forEach(([name, prompt]) => {
            this.prompts.set(name, prompt);
        });
    }
    setupHandlers() {
        // 工具相关处理器
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: Object.entries(tools).map(([name, tool]) => ({
                    name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                })),
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const tool = tools[name];
            if (!tool) {
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }
            try {
                return await tool.execute(args);
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
        // 资源相关处理器
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: Array.from(this.resources.entries()).map(([name, resource]) => ({
                    uri: resource.uri,
                    name: resource.name,
                    description: resource.description,
                    mimeType: resource.mimeType
                }))
            };
        });
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const { uri } = request.params;
            const resource = Array.from(this.resources.values()).find((r) => r.uri === uri);
            if (!resource) {
                throw new Error(`Resource ${uri} not found`);
            }
            const content = await resource.read();
            return {
                contents: [
                    {
                        uri,
                        mimeType: resource.mimeType,
                        text: content
                    }
                ]
            };
        });
        // 提示相关处理器
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            return {
                prompts: Array.from(this.prompts.entries()).map(([name, prompt]) => ({
                    name,
                    description: prompt.description,
                    arguments: prompt.arguments
                }))
            };
        });
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const prompt = this.prompts.get(name);
            if (!prompt) {
                throw new Error(`Prompt ${name} not found`);
            }
            const content = await prompt.generate(args);
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: content
                        }
                    }
                ]
            };
        });
    }
    async start() {
        try {
            logger.info('Initializing tools...');
            // Initialize tools
            await initializeTools();
            logger.info('Tools initialized successfully');
            // Start server
            logger.info('Starting server...');
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            logger.info("MCP server running on stdio");
        }
        catch (error) {
            logger.error('Failed to start server:', error);
            throw error;
        }
    }
}
// 启动服务器
const server = new CustomMCPServer();
server.start().catch((error) => {
    logger.error("Server error:", error);
    process.exit(1);
});
export { CustomMCPServer };
//# sourceMappingURL=server.js.map