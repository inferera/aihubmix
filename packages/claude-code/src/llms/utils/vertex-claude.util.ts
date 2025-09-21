import { UnifiedChatRequest, UnifiedMessage, UnifiedTool } from "../types/llm";

// Vertex Claude消息接口
interface ClaudeMessage {
  role: "user" | "assistant";
  content: Array<{
    type: "text" | "image";
    text?: string;
    source?: {
      type: "base64";
      media_type: string;
      data: string;
    };
  }>;
}

// Vertex Claude工具接口
interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
    $schema?: string;
  };
}

// Vertex Claude请求接口
interface VertexClaudeRequest {
  anthropic_version: "vertex-2023-10-16";
  messages: ClaudeMessage[];
  max_tokens: number;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  tools?: ClaudeTool[];
  tool_choice?: "auto" | "none" | { type: "tool"; name: string };
}

// Vertex Claude响应接口
interface VertexClaudeResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  id: string;
  model: string;
  role: "assistant";
  stop_reason: string;
  stop_sequence: null;
  type: "message";
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  tool_use?: Array<{
    id: string;
    name: string;
    input: Record<string, any>;
  }>;
}

export function buildRequestBody(
  request: UnifiedChatRequest
): VertexClaudeRequest {
  const messages: ClaudeMessage[] = [];

  for (let i = 0; i < request.messages.length; i++) {
    const message = request.messages[i];
    const isLastMessage = i === request.messages.length - 1;
    const isAssistantMessage = message.role === "assistant";

    const content: ClaudeMessage["content"] = [];

    if (typeof message.content === "string") {
      // 保留所有字符串内容，即使是空字符串，因为可能包含重要信息
      content.push({
        type: "text",
        text: message.content,
      });
    } else if (Array.isArray(message.content)) {
      message.content.forEach((item) => {
        if (item.type === "text") {
          // 保留所有文本内容，即使是空字符串
          content.push({
            type: "text",
            text: item.text || "",
          });
        } else if (item.type === "image_url") {
          // 处理图片内容
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: item.media_type || "image/jpeg",
              data: item.image_url.url,
            },
          });
        }
      });
    }

    // 只跳过完全空的非最后一条消息（没有内容和工具调用）
    if (
      !isLastMessage &&
      content.length === 0 &&
      !message.tool_calls &&
      !message.content
    ) {
      continue;
    }

    // 对于最后一条 assistant 消息，如果没有内容但有工具调用，则添加空内容
    if (
      isLastMessage &&
      isAssistantMessage &&
      content.length === 0 &&
      message.tool_calls
    ) {
      content.push({
        type: "text",
        text: "",
      });
    }

    messages.push({
      role: message.role === "assistant" ? "assistant" : "user",
      content,
    });
  }

  const requestBody: VertexClaudeRequest = {
    anthropic_version: "vertex-2023-10-16",
    messages,
    max_tokens: request.max_tokens || 1000,
    stream: request.stream || false,
    ...(request.temperature && { temperature: request.temperature }),
  };

  // 处理工具定义
  if (request.tools && request.tools.length > 0) {
    requestBody.tools = request.tools.map((tool: UnifiedTool) => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters,
    }));
  }

  // 处理工具选择
  if (request.tool_choice) {
    if (request.tool_choice === "auto" || request.tool_choice === "none") {
      requestBody.tool_choice = request.tool_choice;
    } else if (typeof request.tool_choice === "string") {
      // 如果 tool_choice 是字符串，假设是工具名称
      requestBody.tool_choice = {
        type: "tool",
        name: request.tool_choice,
      };
    }
  }

  return requestBody;
}

export function transformRequestOut(
  request: Record<string, any>
): UnifiedChatRequest {
  const vertexRequest = request as VertexClaudeRequest;

  const messages: UnifiedMessage[] = vertexRequest.messages.map((msg) => {
    const content = msg.content.map((item) => {
      if (item.type === "text") {
        return {
          type: "text" as const,
          text: item.text || "",
        };
      } else if (item.type === "image" && item.source) {
        return {
          type: "image_url" as const,
          image_url: {
            url: item.source.data,
          },
          media_type: item.source.media_type,
        };
      }
      return {
        type: "text" as const,
        text: "",
      };
    });

    return {
      role: msg.role,
      content,
    };
  });

  const result: UnifiedChatRequest = {
    messages,
    model: request.model || "claude-sonnet-4@20250514",
    max_tokens: vertexRequest.max_tokens,
    temperature: vertexRequest.temperature,
    stream: vertexRequest.stream,
  };

  // 处理工具定义
  if (vertexRequest.tools && vertexRequest.tools.length > 0) {
    result.tools = vertexRequest.tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object" as const,
          properties: tool.input_schema.properties,
          required: tool.input_schema.required,
          additionalProperties: tool.input_schema.additionalProperties,
          $schema: tool.input_schema.$schema,
        },
      },
    }));
  }

  // 处理工具选择
  if (vertexRequest.tool_choice) {
    if (typeof vertexRequest.tool_choice === "string") {
      result.tool_choice = vertexRequest.tool_choice;
    } else if (vertexRequest.tool_choice.type === "tool") {
      result.tool_choice = vertexRequest.tool_choice.name;
    }
  }

  return result;
}

export async function transformResponseOut(
  response: Response,
  providerName: string,
  logger?: any
): Promise<Response> {
  if (response.headers.get("Content-Type")?.includes("application/json")) {
    const jsonResponse = (await response.json()) as VertexClaudeResponse;

    // 处理工具调用
    let tool_calls = undefined;
    if (jsonResponse.tool_use && jsonResponse.tool_use.length > 0) {
      tool_calls = jsonResponse.tool_use.map((tool) => ({
        id: tool.id,
        type: "function" as const,
        function: {
          name: tool.name,
          arguments: JSON.stringify(tool.input),
        },
      }));
    }

    // 转换为OpenAI格式的响应
    const res = {
      id: jsonResponse.id,
      choices: [
        {
          finish_reason: jsonResponse.stop_reason || null,
          index: 0,
          message: {
            content: jsonResponse.content[0]?.text || "",
            role: "assistant",
            ...(tool_calls && { tool_calls }),
          },
        },
      ],
      created: parseInt(new Date().getTime() / 1000 + "", 10),
      model: jsonResponse.model,
      object: "chat.completion",
      usage: {
        completion_tokens: jsonResponse.usage.output_tokens,
        prompt_tokens: jsonResponse.usage.input_tokens,
        total_tokens:
          jsonResponse.usage.input_tokens + jsonResponse.usage.output_tokens,
      },
    };

    return new Response(JSON.stringify(res), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } else if (response.headers.get("Content-Type")?.includes("stream")) {
    // 处理流式响应
    if (!response.body) {
      return response;
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const processLine = (
      line: string,
      controller: ReadableStreamDefaultController
    ) => {
      if (line.startsWith("data: ")) {
        const chunkStr = line.slice(6).trim();
        if (chunkStr) {
          logger?.debug({ chunkStr }, `${providerName} chunk:`);
          try {
            const chunk = JSON.parse(chunkStr);

            // 处理 Anthropic 原生格式的流式响应
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta?.type === "text_delta"
            ) {
              // 这是 Anthropic 原生格式，需要转换为 OpenAI 格式
              const res = {
                choices: [
                  {
                    delta: {
                      role: "assistant",
                      content: chunk.delta.text || "",
                    },
                    finish_reason: null,
                    index: 0,
                    logprobs: null,
                  },
                ],
                created: parseInt(new Date().getTime() / 1000 + "", 10),
                id: chunk.id || "",
                model: chunk.model || "",
                object: "chat.completion.chunk",
                system_fingerprint: "fp_a49d71b8a1",
                usage: {
                  completion_tokens: chunk.usage?.output_tokens || 0,
                  prompt_tokens: chunk.usage?.input_tokens || 0,
                  total_tokens:
                    (chunk.usage?.input_tokens || 0) +
                    (chunk.usage?.output_tokens || 0),
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(res)}\n\n`)
              );
            } else if (
              chunk.type === "content_block_delta" &&
              chunk.delta?.type === "input_json_delta"
            ) {
              // 处理工具调用的参数增量
              const res = {
                choices: [
                  {
                    delta: {
                      tool_calls: [
                        {
                          index: chunk.index || 0,
                          function: {
                            arguments: chunk.delta.partial_json || "",
                          },
                        },
                      ],
                    },
                    finish_reason: null,
                    index: 0,
                    logprobs: null,
                  },
                ],
                created: parseInt(new Date().getTime() / 1000 + "", 10),
                id: chunk.id || "",
                model: chunk.model || "",
                object: "chat.completion.chunk",
                system_fingerprint: "fp_a49d71b8a1",
                usage: {
                  completion_tokens: chunk.usage?.output_tokens || 0,
                  prompt_tokens: chunk.usage?.input_tokens || 0,
                  total_tokens:
                    (chunk.usage?.input_tokens || 0) +
                    (chunk.usage?.output_tokens || 0),
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(res)}\n\n`)
              );
            } else if (
              chunk.type === "content_block_start" &&
              chunk.content_block?.type === "tool_use"
            ) {
              // 处理工具调用开始
              const res = {
                choices: [
                  {
                    delta: {
                      tool_calls: [
                        {
                          index: chunk.index || 0,
                          id: chunk.content_block.id,
                          type: "function",
                          function: {
                            name: chunk.content_block.name,
                            arguments: "",
                          },
                        },
                      ],
                    },
                    finish_reason: null,
                    index: 0,
                    logprobs: null,
                  },
                ],
                created: parseInt(new Date().getTime() / 1000 + "", 10),
                id: chunk.id || "",
                model: chunk.model || "",
                object: "chat.completion.chunk",
                system_fingerprint: "fp_a49d71b8a1",
                usage: {
                  completion_tokens: chunk.usage?.output_tokens || 0,
                  prompt_tokens: chunk.usage?.input_tokens || 0,
                  total_tokens:
                    (chunk.usage?.input_tokens || 0) +
                    (chunk.usage?.output_tokens || 0),
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(res)}\n\n`)
              );
            } else if (chunk.type === "message_delta") {
              // 处理消息结束
              const res = {
                choices: [
                  {
                    delta: {},
                    finish_reason:
                      chunk.delta?.stop_reason === "tool_use"
                        ? "tool_calls"
                        : chunk.delta?.stop_reason === "max_tokens"
                        ? "length"
                        : chunk.delta?.stop_reason === "stop_sequence"
                        ? "content_filter"
                        : "stop",
                    index: 0,
                    logprobs: null,
                  },
                ],
                created: parseInt(new Date().getTime() / 1000 + "", 10),
                id: chunk.id || "",
                model: chunk.model || "",
                object: "chat.completion.chunk",
                system_fingerprint: "fp_a49d71b8a1",
                usage: {
                  completion_tokens: chunk.usage?.output_tokens || 0,
                  prompt_tokens: chunk.usage?.input_tokens || 0,
                  total_tokens:
                    (chunk.usage?.input_tokens || 0) +
                    (chunk.usage?.output_tokens || 0),
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(res)}\n\n`)
              );
            } else if (chunk.type === "message_stop") {
              // 发送结束标记
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            } else {
              // 处理其他格式的响应（保持原有逻辑作为后备）
              const res = {
                choices: [
                  {
                    delta: {
                      role: "assistant",
                      content: chunk.content?.[0]?.text || "",
                    },
                    finish_reason: chunk.stop_reason?.toLowerCase() || null,
                    index: 0,
                    logprobs: null,
                  },
                ],
                created: parseInt(new Date().getTime() / 1000 + "", 10),
                id: chunk.id || "",
                model: chunk.model || "",
                object: "chat.completion.chunk",
                system_fingerprint: "fp_a49d71b8a1",
                usage: {
                  completion_tokens: chunk.usage?.output_tokens || 0,
                  prompt_tokens: chunk.usage?.input_tokens || 0,
                  total_tokens:
                    (chunk.usage?.input_tokens || 0) +
                    (chunk.usage?.output_tokens || 0),
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(res)}\n\n`)
              );
            }
          } catch (error: any) {
            logger?.error(
              `Error parsing ${providerName} stream chunk`,
              chunkStr,
              error.message
            );
          }
        }
      }
    };

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (buffer) {
                processLine(buffer, controller);
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");

            buffer = lines.pop() || "";

            for (const line of lines) {
              processLine(line, controller);
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
  return response;
}
