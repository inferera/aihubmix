import Server from "@musistudio/llms";
import { readConfigFile, writeConfigFile } from "../config";
import { ServerConfig } from "../types/index";
import { existsSync } from "fs";
import { DEFAULT_ROUTER } from "../constants";

export const createServer = (config: ServerConfig): Server => {
  // 确保配置文件存在，避免@musistudio/llms包显示错误
  if (!existsSync(config.jsonPath)) {
    // 创建默认配置文件
    const defaultConfig = {
      HOST: config.initialConfig.HOST || "127.0.0.1",
      PORT: config.initialConfig.PORT || 3456,
      LOG_FILE: config.initialConfig.LOG_FILE || "",
      Router: DEFAULT_ROUTER,
    };
    
    // 写入默认配置文件
    const fs = require("fs");
    fs.writeFileSync(config.jsonPath, JSON.stringify(defaultConfig, null, 2));
  }

  const server = new Server({
    jsonPath: config.jsonPath,
    initialConfig: config.initialConfig,
  });

  // Add API endpoints for configuration management
  server.app.get("/api/config", async (request: any, reply: any) => {
    try {
      const config = await readConfigFile();
      return reply.send(config);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  server.app.post("/api/config", async (request: any, reply: any) => {
    try {
      const newConfig = request.body as any;
      await writeConfigFile(newConfig);
      return reply.send({ success: true });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  server.app.post("/api/restart", async (request: any, reply: any) => {
    try {
      // Send response before restarting
      reply.send({ success: true });
      
      // Restart the server after a short delay
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  return server;
}; 
