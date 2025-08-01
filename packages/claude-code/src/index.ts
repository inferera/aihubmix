import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import { initConfig, initDir } from "./config";
import { createServer } from "./services/server";
import { router } from "./core/router";
import { apiKeyAuth } from "./middleware/auth";
import {
  cleanupPidFile,
  isServiceRunning,
  savePid,
} from "./utils/processCheck";
import { CONFIG_FILE } from "./constants";
import { RunOptions } from "./types/index";

async function initializeClaudeConfig() {
  const homeDir = homedir();
  const configPath = join(homeDir, ".claude.json");
  if (!existsSync(configPath)) {
    const userID = Array.from(
      { length: 64 },
      () => Math.random().toString(16)[2]
    ).join("");
    const configContent = {
      numStartups: 184,
      autoUpdaterStatus: "enabled",
      userID,
      hasCompletedOnboarding: true,
      lastOnboardingVersion: "1.0.17",
      projects: {},
    };
    await writeFile(configPath, JSON.stringify(configContent, null, 2));
  }
}

async function run(options: RunOptions = {}) {
  // Check if service is already running
  if (isServiceRunning()) {
    console.log("✅ Service is already running in the background.");
    return;
  }

  await initializeClaudeConfig();
  await initDir();
  const config = await initConfig();
  let HOST = config.HOST || "127.0.0.1";

  const port = config.PORT || 3456;

  // Save the PID of the background process
  savePid(process.pid);

  // Handle SIGINT (Ctrl+C) to clean up PID file
  process.on("SIGINT", () => {
    console.log("Received SIGINT, cleaning up...");
    cleanupPidFile();
    process.exit(0);
  });

  // Handle SIGTERM to clean up PID file
  process.on("SIGTERM", () => {
    cleanupPidFile();
    process.exit(0);
  });
  console.log(HOST)

  // Use port from environment variable if set (for background process)
  const servicePort = process.env.SERVICE_PORT
    ? parseInt(process.env.SERVICE_PORT)
    : port;

  const server = createServer({
    jsonPath: CONFIG_FILE,
    initialConfig: {
      providers: [
        {
          name: "aihubmix",
          api_base_url: "https://aihubmix.com/v1/chat/completions",
          api_key: config.API_KEY,
          models: ["Z/glm-4.5", "claude-3-5-sonnet-20241022", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-pro-preview", "deepseek-reasoner", "deepseek-chat", "DeepSeek-R1", "DeepSeek-V3", "deepseek-chat", "gpt-4o-mini", "gpt-4.1", "claude-opus-4-20250514"],
        }
      ],
      HOST: HOST,
      PORT: servicePort,
      LOG_FILE: join(
        homedir(),
        ".aihubmix-claude-code",
        "aihubmix-claude-code.log"
      ),
    },
  });
  server.addHook("preHandler", apiKeyAuth(config));
  server.addHook("preHandler", async (req: any, reply: any) => {
    if(req.url.startsWith("/v1/messages")) {
      router(req, reply, config)
    }
  });
  server.start();
}

export { run };
// run();
