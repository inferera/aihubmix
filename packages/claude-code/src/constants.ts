import path from "node:path";
import os from "node:os";

export const HOME_DIR = path.join(os.homedir(), ".aihubmix-claude-code");

export const CONFIG_FILE = path.join(HOME_DIR, "config.json");

export const PLUGINS_DIR = path.join(HOME_DIR, "plugins");

export const PID_FILE = path.join(HOME_DIR, '.aihubmix-claude-code.pid');

export const REFERENCE_COUNT_FILE = path.join(os.tmpdir(), "claude-code-reference-count.txt");

export const DEFAULT_ROUTER = {
  "default": "claude-sonnet-4-20250514",
  "background": "claude-sonnet-4-20250514",
  "think": "claude-sonnet-4-20250514",
  "longContext": "gpt-4.1",
  "longContextThreshold": 60000,
  "webSearch": "gemini-2.0-flash-search"
}