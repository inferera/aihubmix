// 工具相关类型
export interface Tool {
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (args: any) => Promise<any>;
}

// 资源相关类型
export interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  read: () => Promise<string>;
}

// 提示相关类型
export interface Prompt {
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  generate: (args: any) => Promise<string>;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 文件操作类型
export interface FileOperation {
  type: 'read' | 'write' | 'delete';
  path: string;
  content?: string;
}

// 配置类型
export interface Config {
  port: number;
  environment: string;
  corsOrigin: string;
  logLevel: string;
} 
