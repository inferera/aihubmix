import { spawn } from "child_process";
import { platform } from "os";
import {
  incrementReferenceCount,
  decrementReferenceCount,
} from "./processCheck";
import { closeService } from "./close";
import { readConfigFile } from "../config";

export async function executeCodeCommand(args: string[] = []) {
  // Set environment variables
  const config = await readConfigFile();
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ANTHROPIC_AUTH_TOKEN: "test",
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${config?.PORT || 3456}`,
    API_TIMEOUT_MS: String(config?.API_TIMEOUT_MS ?? 600000), // Default to 10 minutes if not set
  };

  // Increment reference count when command starts
  incrementReferenceCount();

  // Determine shell based on platform
  const getShell = () => {
    const currentPlatform = platform();
    switch (currentPlatform) {
      case "win32":
        // On Windows, use cmd.exe or PowerShell
        return process.env.COMSPEC || "cmd.exe";
      case "darwin":
        // On macOS, use bash
        return "/bin/bash";
      default:
        // On Linux and other Unix-like systems, use bash
        return "/bin/bash";
    }
  };

  // Execute claude command
  const claudePath = process.env.CLAUDE_PATH || "claude";
  const claudeProcess = spawn(claudePath, args, {
    env,
    stdio: "inherit",
    shell: getShell(),
  });

  claudeProcess.on("error", (error) => {
    console.error("Failed to start claude command:", error.message);
    console.log(
      "Make sure Claude Code is installed: npm install -g @anthropic-ai/claude-code"
    );
    decrementReferenceCount();
    process.exit(1);
  });

  claudeProcess.on("close", (code) => {
    decrementReferenceCount();
    closeService();
    process.exit(code || 0);
  });
}
