import { Tool } from '../types/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Helper function to poll for completion
async function pollForCompletion(pollingUrl: string, apiKey: string, maxAttempts: number = 30): Promise<any[]> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(pollingUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Polling request failed with status ${response.status}`);
      }

      const data = await response.json() as any;
      
      // Check if task is completed
      if (data.status === "succeeded" || data.status === "completed" || data.status === "Ready") {
        const contents: any[] = [];
        
        // Handle the completed result
        if (data.output) {
          // Handle b64_json array
          if (data.output.b64_json && Array.isArray(data.output.b64_json)) {
            for (const item of data.output.b64_json) {
              if (item && typeof item === "object" && item.bytesBase64) {
                contents.push({
                  type: "image",
                  data: item.bytesBase64,
                  mimeType: "image/png",
                });
              }
            }
          }
          
          // Handle urls array
          if (data.output.urls && Array.isArray(data.output.urls)) {
            for (const url of data.output.urls) {
              if (typeof url === "string") {
                contents.push({
                  type: "text",
                  text: url,
                });
              }
            }
          }
          
          // Handle direct array output
          if (Array.isArray(data.output)) {
            for (const item of data.output) {
              if (item && typeof item === "object" && item.bytesBase64) {
                contents.push({
                  type: "image",
                  data: item.bytesBase64,
                  mimeType: "image/png",
                });
              }
            }
          }
        }
        
        // Handle new format with result.sample
        if (data.result && data.result.sample) {
          contents.push({
            type: "text",
            text: data.result.sample,
          });
        }
        
        return contents;
      } else if (data.status === "failed") {
        throw new Error(`Task failed: ${data.error || "Unknown error"}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return [];
}

export const paintingTools: Record<string, Tool> = {
  image_generate: {
    description: "openai/gpt-image-1:[Excellent feature learning and transfer capabilities, stable multilingual text rendering, supports multiple style generation, accurately follows complex instructions, rich world knowledge, 3 common aspect ratios, multiple quality specifications, supports multiple reference images, supports multiple outputs in single generation, supports transparent backgrounds, strict security protection, suitable for daily creative work, average generation speed 2 minutes/image]; bfl/FLUX.1-Kontext-pro:[Strong contextual understanding ability, good detail representation, supports rich aspect ratios, suitable for daily quick creation, high cost-effectiveness, supports multiple outputs in single generation];google/imagen-4.0-ultra-generate-preview-06-06:[High quality, supports diverse styles, supports simple text rendering, 5 common aspect ratios, generates only 1 image each time, currently supports only English prompts, does not generate children's images, supports multiple outputs in single generation];google/imagen-4.0-generate-preview-06-06:[Creates high-quality, realistic images, supports simple text rendering, diverse styles, fast generation speed, 5 common aspect ratios, can generate 1-4 images per call, suitable for daily creativity and content production, currently supports only English prompts, does not generate children's images, supports multiple outputs in single generation];ideogram/V3:[Strong text-to-image expressiveness, strong multilingual understanding capability, rich artistic styles, outstanding design capabilities, supports creative variants, supports rich aspect ratios, easily handles ultra-wide formats, supports reference images/local editing/multi-image fusion/background replacement/image extension, supports multiple outputs in single generation]",
    inputSchema: {
      type: "object",
      properties: {
        model: {
          type: "string",
          enum: [
            "opanai/gpt-image-1",
            "bfl/FLUX.1-Kontext-pro",
            "google/imagen-4.0-ultra-generate-preview-06-06",
            "google/imagen-4.0-generate-preview-06-06",
            "ideogram/V3",
          ],
          default: "opanai/gpt-image-1",
          description: "选择要使用的模型",
        },
        prompt: {
          type: "string",
          description: "提示词，所有模型通用",
        },
        rendering_speed: {
          type: "string",
          enum: ["QUALITY", "SPEED"],
          default: "QUALITY",
          description: "渲染速度，仅 ideogram/V3 支持",
        },
        aspect_ratio: {
          type: "string",
          enum: ["1x1", "2x1", "1x2", "16x9", "9x16", "4x5", "5x4", "3x4", "4x3"],
          default: "1x1",
          description: "图片宽高比例，ideogram/V3及flux 系列模型支持",
        },
        n: {
          type: "integer",
          default: 1,
          maximum: 10,
          minimum: 1,
          description: "生成图片数量，opanai/gpt-image-1 支持",
        },
        size: {
          type: "string",
          default: "auto",
          enum: ["1024x1024", "1536x1024", "1024x1536", "auto"],
          description: "图片尺寸，opanai/gpt-image-1支持",
        },
        quality: {
          type: "string",
          enum: ["high", "medium", "low", "auto"],
          default: "auto",
          description: "图片质量，opanai/gpt-image-1支持",
        },
        moderation: {
          type: "string",
          enum: ["low", "auto"],
          default: "low",
          description: "内容审核，opanai/gpt-image-1支持",
        },
        background: {
          type: "string",
          default: "auto",
          enum: ["transparent", "opaque", "auto"],
          description: "背景，opanai/gpt-image-1支持",
        },
        safety_tolerance: {
          type: "string",
          enum: ["0", "1", "2", "3", "4", "5", "6"],
          default: "0",
          description: "安全容忍度，flux 系列模型支持",
        },
      },
      required: ["prompt", "model"],
    },
    async execute(args: {
      model: string;
      prompt: string;
      rendering_speed?: string;
      aspect_ratio?: string;
      n?: number;
      size?: string;
      quality?: string;
      moderation?: string;
      background?: string;
      safety_tolerance?: string;
    }): Promise<any> {
      const {
        model = "opanai/gpt-image-1",
        prompt,
        rendering_speed = "QUALITY",
        aspect_ratio = "1x1",
        n = 1,
        size = "auto",
        quality = "auto",
        moderation = "low",
        background = "auto",
        safety_tolerance = "0",
      } = args;

      // Get API key from environment variable
      const apiKey = process.env.AIHUBMIX_API_KEY;
      if (!apiKey || apiKey.trim().length === 0) {
        throw new McpError(
          ErrorCode.InternalError,
          "AIHUBMIX_API_KEY environment variable is required. Please set your API key."
        );
      }

      // Validate parameters
      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Prompt is required and must be a non-empty string"
        );
      }

      if (!model || typeof model !== "string" || model.trim().length === 0) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Model is required and must be a non-empty string"
        );
      }

      try {
        // Prepare input based on model
        const input: any = { prompt };

        switch (model) {
          case "ideogram/V3":
            input.rendering_speed = rendering_speed;
            input.aspect_ratio = aspect_ratio;
            break;
          case "opanai/gpt-image-1":
            input.n = n;
            input.size = size;
            input.quality = quality;
            input.moderation = moderation;
            input.background = background;
            break;
          case "bfl/FLUX.1-Kontext-pro":
            input.aspect_ratio = aspect_ratio.replace("x", ":");
            break;
          default:
            // For other models, just use the prompt
            break;
        }

        const requestBody = {
          input,
        };

        const response = await fetch(`https://aihubmix.com/v1/models/${model}/predictions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new McpError(
            ErrorCode.InternalError,
            `API request failed with status ${response.status}: ${errorText}`
          );
        }

        const responseData = await response.json() as any;
        const output = responseData.output || {};

        const contents: any[] = [];

        // Handle different output formats based on the response structure
        
        // Format 1: {"output":{"b64_json":[{"bytesBase64":"..."}]}}
        if (output.b64_json && Array.isArray(output.b64_json)) {
          for (const item of output.b64_json) {
            if (item && typeof item === "object" && item.bytesBase64) {
              contents.push({
                type: "image",
                data: item.bytesBase64,
                mimeType: "image/png",
              });
            }
          }
        }

        // Format 2: {"output":[{"bytesBase64":"..."}]}
        if (Array.isArray(output) && output.length > 0) {
          for (const item of output) {
            if (item && typeof item === "object" && item.bytesBase64) {
              contents.push({
                type: "image",
                data: item.bytesBase64,
                mimeType: "image/png",
              });
            }
          }
        }

        // Format 3: {"output":[{"polling_url":"...","taskId":"..."}]}
        if (Array.isArray(output) && output.length > 0) {
          for (const item of output) {
            if (item && typeof item === "object" && item.polling_url) {
              // Poll for completion
              try {
                const finalResult = await pollForCompletion(item.polling_url, apiKey);
                if (finalResult && finalResult.length > 0) {
                  contents.push(...finalResult);
                } else {
                  contents.push({
                    type: "text",
                    text: `Polling URL: ${item.polling_url}`,
                  });
                }
              } catch (error) {
                contents.push({
                  type: "text",
                  text: `Polling URL: ${item.polling_url} (Error: ${error instanceof Error ? error.message : String(error)})`,
                });
              }
            }
          }
        }

        // Format 4: {"output":{"urls":["https://..."]}}
        if (output.urls && Array.isArray(output.urls)) {
          for (const url of output.urls) {
            if (typeof url === "string") {
              contents.push({
                type: "text",
                text: url,
              });
            }
          }
        }

        return {
          content: contents,
          isError: false,
        };
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
}; 
