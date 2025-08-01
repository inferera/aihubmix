#!/usr/bin/env node

import { run } from "./index";
import { showStatus } from "./utils/status";
import { executeCodeCommand } from "./utils/codeCommand";
import { cleanupPidFile, isServiceRunning } from "./utils/processCheck";
import { version } from "../package.json";
import { spawn } from "child_process";
import { PID_FILE } from "./constants";
import fs, { readFileSync } from "fs";
import { join } from "path";

const command = process.argv[2];

const HELP_TEXT = `
Usage: acc [command]

Commands:
  start         Start server 
  stop          Stop server
  restart       Restart server
  status        Show server status
  code          Execute claude command
  -v, version   Show version information
  -h, help      Show help information

Example:
  acc start
  acc code "Write a Hello World"
`;

async function waitForService(
  timeout: number = 10000,
  interval: number = 500
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (isServiceRunning()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
}

async function startService() {
  try {
    await run();
  } catch (error: any) {
    console.error("Failed to start service:", error.message);
    process.exit(1);
  }
}

async function stopService() {
  try {
    if (isServiceRunning()) {
      const pid = readFileSync(PID_FILE, "utf-8").trim();
      process.kill(parseInt(pid), "SIGTERM");
      
      // Wait for the process to terminate
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        if (!isServiceRunning()) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      // Force kill if still running
      if (isServiceRunning()) {
        process.kill(parseInt(pid), "SIGKILL");
      }
    }
    
    cleanupPidFile();
    console.log("Service stopped successfully.");
  } catch (error: any) {
    console.error("Failed to stop service:", error.message);
    cleanupPidFile();
  }
}

async function main() {
  switch (command) {
    case "start":
      if (isServiceRunning()) {
        console.log("✅ Service is already running.");
      } else {
        console.log("🚀 Starting Claude Code service...");
        await startService();
      }
      break;
    case "stop":
      console.log("🛑 Stopping Claude Code service...");
      await stopService();
      break;
    case "status":
      showStatus();
      break;
    case "code":
      if (!isServiceRunning()) {
        console.log("Service not running, starting service...");
        const cliPath = join(__dirname, "cli.js");
        const startProcess = spawn("node", [cliPath, "start"], {
          detached: true,
          stdio: "ignore",
        });

        startProcess.on("error", (error) => {
          console.error("Failed to start service:", error.message);
          process.exit(1);
        });

        startProcess.unref();

        if (await waitForService()) {
          executeCodeCommand(process.argv.slice(3));
        } else {
          console.error(
            "Service startup timeout, please manually run `acc start` to start the service"
          );
          process.exit(1);
        }
      } else {
        executeCodeCommand(process.argv.slice(3));
      }
      break;
    case "-v":
    case "version":
      console.log(`claude-code version: ${version}`);
      break;
    case "restart":
      // Stop the service if it's running
      try {
        if (isServiceRunning()) {
          const pid = readFileSync(PID_FILE, "utf-8").trim();
          process.kill(parseInt(pid), "SIGTERM");
          
          // Wait for the process to terminate
          let attempts = 0;
          const maxAttempts = 10;
          while (attempts < maxAttempts) {
            if (!isServiceRunning()) {
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
          
          // Force kill if still running
          if (isServiceRunning()) {
            process.kill(parseInt(pid), "SIGKILL");
          }
          
          try {
            cleanupPidFile();
          } catch (e) {
            // Ignore cleanup errors
          }
        }
        console.log("claude code service has been stopped.");
      } catch (e) {
        console.log("Service was not running or failed to stop.");
        cleanupPidFile();
      }

      // Start the service again in the background
      console.log("Starting claude code service...");
      const cliPath = join(__dirname, "cli.js");
      const startProcess = spawn("node", [cliPath, "start"], {
        detached: true,
        stdio: "pipe", // 改为pipe以便捕获错误
      });

      startProcess.on("error", (error) => {
        console.error("Failed to start service:", error.message);
        process.exit(1);
      });

      // 捕获启动过程中的错误
      startProcess.stderr.on("data", (data) => {
        const errorMsg = data.toString();
        console.error("Service startup error:", errorMsg);
      });

      startProcess.unref();

      if (await waitForService()) {
        console.log("✅ Service restarted successfully.");
      } else {
        console.error("Service restart timeout.");
        console.error("Please check if API_KEY is properly configured.");
        process.exit(1);
      }
      break;
    case "-h":
    case "help":
    default:
      console.log(HELP_TEXT);
      break;
  }
}

main().catch(console.error);
