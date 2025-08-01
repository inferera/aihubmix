import path from "node:path";
import os from "node:os";

export const HOME_DIR = path.join(os.homedir(), ".aihubmix-claude-code");

export const CONFIG_FILE = path.join(HOME_DIR, "config.json");

export const PLUGINS_DIR = path.join(HOME_DIR, "plugins");

export const PID_FILE = path.join(HOME_DIR, '.aihubmix-claude-code.pid');

export const REFERENCE_COUNT_FILE = path.join(os.tmpdir(), "claude-code-reference-count.txt");


export const DEFAULT_CONFIG = {
  LOG: false,
  API_TIMEOUT_MS: 600000,
  Providers: [],
  Router: {
    default: "",
    background: "",
    think: "",
    longContext: "",
    longContextThreshold: 60000,
    webSearch: "",
  },
};
