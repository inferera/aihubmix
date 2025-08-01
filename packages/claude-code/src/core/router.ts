import {
  MessageCreateParamsBase,
  MessageParam,
  Tool,
} from "../types/index";
import { get_encoding } from "tiktoken";
import { DEFAULT_ROUTER } from "../constants";
import { log } from "../utils/log";
import { Router } from "../types/index";

const enc = get_encoding("cl100k_base");

const calculateTokenCount = (
  messages: MessageParam[],
  system: any,
  tools: Tool[]
) => {
  let tokenCount = 0;
  if (Array.isArray(messages)) {
    messages.forEach((message) => {
      if (typeof message.content === "string") {
        tokenCount += enc.encode(message.content).length;
      } else if (Array.isArray(message.content)) {
        message.content.forEach((contentPart: any) => {
          if (contentPart.type === "text") {
            tokenCount += enc.encode(contentPart.text).length;
          } else if (contentPart.type === "tool_use") {
            tokenCount += enc.encode(
              JSON.stringify(contentPart.input)
            ).length;
          } else if (contentPart.type === "tool_result") {
            tokenCount += enc.encode(
              typeof contentPart.content === "string"
                ? contentPart.content
                : JSON.stringify(contentPart.content)
            ).length;
          }
        });
      }
    });
  }
  if (typeof system === "string") {
    tokenCount += enc.encode(system).length;
  } else if (Array.isArray(system)) {
    system.forEach((item: any) => {
      if (item.type !== "text") return;
      if (typeof item.text === "string") {
        tokenCount += enc.encode(item.text).length;
      } else if (Array.isArray(item.text)) {
        item.text.forEach((textPart: any) => {
          tokenCount += enc.encode(textPart || "").length;
        });
      }
    });
  }
  if (tools) {
    tools.forEach((tool: Tool) => {
      if (tool.description) {
        tokenCount += enc.encode(tool.name + tool.description).length;
      }
      if (tool.input_schema) {
        tokenCount += enc.encode(JSON.stringify(tool.input_schema)).length;
      }
    });
  }
  return tokenCount;
};

const getUseModel = async (req: any, tokenCount: number, router: Router) => {
  if (req.body.model.includes(",")) {
    return req.body.model;
  }
  // if tokenCount is greater than the configured threshold, use the long context model
  const longContextThreshold = router.longContextThreshold || 60000;
  if (tokenCount > longContextThreshold && router.longContext) {
    log("Using long context model due to token count:", tokenCount, "threshold:", longContextThreshold);
    return router.longContext;
  }
  // If the model is claude-3-5-haiku, use the background model
  if (
    req.body.model?.startsWith("claude-3-5-haiku") &&
    router.background
  ) {
    log("Using background model for ", req.body.model);
    return router.background;
  }
  // if exits thinking, use the think model
  if (req.body.thinking && router.think) {
    log("Using think model for ", req.body.thinking);
    return router.think;
  }
  if (
    Array.isArray(req.body.tools) &&
    req.body.tools.some((tool: any) => tool.type?.startsWith("web_search")) &&
    router.webSearch
  ) {
    return router.webSearch;
  }
  return router!.default;
};

export const router = async (req: any, _res: any, config: any) => {
  const { messages, system = [], tools }: MessageCreateParamsBase = req.body;

  const router = Object.assign({}, DEFAULT_ROUTER, config?.Router || {});
  Object.entries(router).forEach(([key, value]) => {
    router[key] = 'aihubmix,' + value
  });
  console.log('router+++++++++', router)
  console.log('config+++++++++', config)
  try {
    const tokenCount = calculateTokenCount(
      messages as MessageParam[],
      system,
      tools as Tool[]
    );

    let model = await getUseModel(req, tokenCount, router);
    req.body.model = model;
  } catch (error: any) {
    log("Error in router middleware:", error.message);
    req.body.model = router!.default;
  }
  return;
}; 
