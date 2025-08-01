import Server from "@musistudio/llms";
import { readConfigFile, writeConfigFile } from "../config";
import { ServerConfig } from "../types/index";

export const createServer = (config: ServerConfig): Server => {
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
