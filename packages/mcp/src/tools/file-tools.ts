// src/tools/file-tools.ts
import { Tool } from '../types/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export const fileTools: Record<string, Tool> = {
  read_file: {
    description: "Read content from a file",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file"
        }
      },
      required: ["path"]
    },
    async execute(args: { path: string }): Promise<any> {
      try {
        const content = await readFile(args.path, 'utf-8');
        return {
          content: [
            {
              type: "text",
              text: content
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  },

  write_file: {
    description: "Write content to a file",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file"
        },
        content: {
          type: "string",
          description: "Content to write"
        }
      },
      required: ["path", "content"]
    },
    async execute(args: { path: string; content: string }): Promise<any> {
      try {
        await writeFile(args.path, args.content, 'utf-8');
        return {
          content: [
            {
              type: "text",
              text: `Successfully wrote to ${args.path}`
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to write file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  },

  list_directory: {
    description: "List contents of a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the directory"
        }
      },
      required: ["path"]
    },
    async execute(args: { path: string }): Promise<any> {
      try {
        const entries = await readdir(args.path, { withFileTypes: true });
        const files = entries.map(entry => ({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file'
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(files, null, 2)
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list directory: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  },

  create_directory: {
    description: "Create a new directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to create the directory"
        }
      },
      required: ["path"]
    },
    async execute(args: { path: string }): Promise<any> {
      try {
        await mkdir(args.path, { recursive: true });
        return {
          content: [
            {
              type: "text",
              text: `Successfully created directory: ${args.path}`
            }
          ]
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
};
