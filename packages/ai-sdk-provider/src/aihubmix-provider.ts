import {
  OpenAIChatLanguageModel,
  OpenAICompletionLanguageModel,
  OpenAIEmbeddingModel,
  OpenAIImageModel,
  OpenAIResponsesLanguageModel,
  OpenAITranscriptionModel,
  OpenAISpeechModel,
} from '@ai-sdk/openai/internal';
import { AnthropicMessagesLanguageModel } from '@ai-sdk/anthropic/internal';
import { GoogleGenerativeAILanguageModel } from '@ai-sdk/google/internal';
import {
  EmbeddingModelV3,
  LanguageModelV3,
  ProviderV3,
  ImageModelV3,
  TranscriptionModelV3,
  SpeechModelV3,
  TranscriptionModelV3CallOptions,
} from '@ai-sdk/provider';
import {
  FetchFunction,
  loadApiKey,
  zodSchema,
  lazySchema,
  type InferSchema,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import { aihubmixTools } from './aihubmix-tools';

/**
 * OpenAI Chat 语言模型的 Provider Options Schema
 * 与 Vercel AI SDK 的 openaiChatLanguageModelOptions 保持一致
 */
export const aihubmixChatProviderOptionsSchema = lazySchema(() =>
  zodSchema(
    z.object({
      /**
       * 修改指定 token 出现在生成内容中的概率
       * 接受一个 JSON 对象，将 token ID（字符串形式）映射到 -100 到 100 之间的偏差值
       */
      logitBias: z.record(z.string(), z.number()).optional(),

      /**
       * 返回 token 的对数概率
       * 设置为 true 返回生成 token 的对数概率
       * 设置为数字返回前 n 个 token 的对数概率
       */
      logprobs: z.union([z.boolean(), z.number()]).optional(),

      /**
       * 是否启用并行工具调用，默认为 true
       */
      parallelToolCalls: z.boolean().optional(),

      /**
       * 代表终端用户的唯一标识符，帮助 OpenAI 监控和检测滥用行为
       */
      user: z.string().optional(),

      /**
       * 推理模型的推理强度，默认为 `medium`
       */
      reasoningEffort: z
        .enum(['none', 'minimal', 'low', 'medium', 'high', 'xhigh'])
        .optional(),

      /**
       * 生成的最大完成 token 数，适用于推理模型
       */
      maxCompletionTokens: z.number().optional(),

      /**
       * 是否在 Responses API 中启用持久化
       */
      store: z.boolean().optional(),

      /**
       * 与请求关联的元数据
       */
      metadata: z.record(z.string().max(64), z.string().max(512)).optional(),

      /**
       * 预测模式的参数
       */
      prediction: z.record(z.string(), z.any()).optional(),

      /**
       * 请求的服务层级
       * - 'auto': 默认服务层级
       * - 'flex': 50% 更便宜但延迟更高（仅限 o3, o4-mini, gpt-5）
       * - 'priority': 更快处理（需要企业版）
       * - 'default': 标准定价和性能
       */
      serviceTier: z.enum(['auto', 'flex', 'priority', 'default']).optional(),

      /**
       * 是否使用严格的 JSON schema 验证
       * @default true
       */
      strictJsonSchema: z.boolean().optional(),

      /**
       * 控制模型响应的详细程度
       * 较低的值会产生更简洁的响应，较高的值会产生更详细的响应
       */
      textVerbosity: z.enum(['low', 'medium', 'high']).optional(),

      /**
       * 提示缓存的缓存键
       */
      promptCacheKey: z.string().optional(),

      /**
       * 提示缓存的保留策略
       * - 'in_memory': 默认，标准提示缓存行为
       * - '24h': 扩展提示缓存，保持缓存前缀最多 24 小时
       */
      promptCacheRetention: z.enum(['in_memory', '24h']).optional(),

      /**
       * 用于帮助检测违反使用政策用户的稳定标识符
       */
      safetyIdentifier: z.string().optional(),

      /**
       * 覆盖此模型的系统消息模式
       * - 'system': 使用 'system' 角色（大多数模型的默认值）
       * - 'developer': 使用 'developer' 角色（推理模型使用）
       * - 'remove': 完全移除系统消息
       */
      systemMessageMode: z.enum(['system', 'developer', 'remove']).optional(),

      /**
       * 强制将此模型视为推理模型
       * 适用于自定义 baseURL 的"隐形"推理模型
       */
      forceReasoning: z.boolean().optional(),
    }),
  ),
);

/**
 * OpenAI Responses API 的 Provider Options Schema
 */
export const aihubmixResponsesProviderOptionsSchema = lazySchema(() =>
  zodSchema(
    z.object({
      /**
       * OpenAI 对话的 ID，用于继续对话
       */
      conversation: z.string().nullish(),

      /**
       * 响应中包含的额外字段
       */
      include: z
        .array(
          z.enum([
            'reasoning.encrypted_content',
            'file_search_call.results',
            'message.output_text.logprobs',
          ]),
        )
        .nullish(),

      /**
       * 模型的指令
       */
      instructions: z.string().nullish(),

      /**
       * 返回 token 的对数概率
       */
      logprobs: z
        .union([z.boolean(), z.number().min(1).max(20)])
        .optional(),

      /**
       * 内置工具调用的最大总数
       */
      maxToolCalls: z.number().nullish(),

      /**
       * 与生成关联的额外元数据
       */
      metadata: z.any().nullish(),

      /**
       * 是否使用并行工具调用，默认为 true
       */
      parallelToolCalls: z.boolean().nullish(),

      /**
       * 上一个响应的 ID，用于继续对话
       */
      previousResponseId: z.string().nullish(),

      /**
       * 提示缓存键
       */
      promptCacheKey: z.string().nullish(),

      /**
       * 提示缓存保留策略
       */
      promptCacheRetention: z.enum(['in_memory', '24h']).nullish(),

      /**
       * 推理模型的推理强度
       */
      reasoningEffort: z.string().nullish(),

      /**
       * 控制推理摘要输出
       */
      reasoningSummary: z.string().nullish(),

      /**
       * 安全监控的标识符
       */
      safetyIdentifier: z.string().nullish(),

      /**
       * 请求的服务层级
       */
      serviceTier: z.enum(['auto', 'flex', 'priority', 'default']).nullish(),

      /**
       * 是否存储生成内容，默认为 true
       */
      store: z.boolean().nullish(),

      /**
       * 是否使用严格的 JSON schema 验证
       */
      strictJsonSchema: z.boolean().nullish(),

      /**
       * 控制模型响应的详细程度
       */
      textVerbosity: z.enum(['low', 'medium', 'high']).nullish(),

      /**
       * 输出截断控制
       */
      truncation: z.enum(['auto', 'disabled']).nullish(),

      /**
       * 代表终端用户的唯一标识符
       */
      user: z.string().nullish(),

      /**
       * 系统消息模式
       */
      systemMessageMode: z.enum(['system', 'developer', 'remove']).optional(),

      /**
       * 强制将模型视为推理模型
       */
      forceReasoning: z.boolean().optional(),
    }),
  ),
);

// Provider Options 类型推断
export type AihubmixChatProviderOptions = InferSchema<
  typeof aihubmixChatProviderOptionsSchema
>;

export type AihubmixResponsesProviderOptions = InferSchema<
  typeof aihubmixResponsesProviderOptionsSchema
>;

// OpenAI Provider 设置类型（保持向后兼容）
type OpenAIProviderSettings = AihubmixChatProviderOptions;


export interface AihubmixProvider extends ProviderV3 {
  (deploymentId: string, settings?: OpenAIProviderSettings): LanguageModelV3;

  readonly specificationVersion: 'v3';

  languageModel(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): LanguageModelV3;

  chat(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): LanguageModelV3;

  responses(deploymentId: string): LanguageModelV3;

  completion(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): LanguageModelV3;

  embedding(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): EmbeddingModelV3;

  embeddingModel(modelId: string): EmbeddingModelV3;

  image(deploymentId: string, settings?: OpenAIProviderSettings): ImageModelV3;

  imageModel(modelId: string): ImageModelV3;

  textEmbedding(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): EmbeddingModelV3;

  textEmbeddingModel(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): EmbeddingModelV3;

  transcription(deploymentId: string): TranscriptionModelV3;

  speech(deploymentId: string): SpeechModelV3;

  speechModel(deploymentId: string): SpeechModelV3;

  tools: typeof aihubmixTools;
}
export interface AihubmixProviderSettings {
  apiKey?: string;
  fetch?: FetchFunction;
  compatibility?: 'strict' | 'compatible';
}

class AihubmixTranscriptionModel extends OpenAITranscriptionModel {
  async doGenerate(options: TranscriptionModelV3CallOptions) {
    // 根据MIME类型设置正确的文件扩展名
    if (options.mediaType) {
      const mimeTypeMap: Record<string, string> = {
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
        'audio/wav': 'wav',
        'audio/flac': 'flac',
        'audio/m4a': 'm4a',
        'audio/mp4': 'mp4',
        'audio/ogg': 'ogg',
        'audio/webm': 'webm',
        'audio/oga': 'oga',
        'audio/mpga': 'mpga',
      };
      
      const extension = mimeTypeMap[options.mediaType];
      if (extension) {
        // 重写getArgs方法来设置正确的文件名
        const originalGetArgs = (this as any).getArgs;
        (this as any).getArgs = async function(args: any) {
          const result = await originalGetArgs.call(this, args);
          if (result.formData) {
            // 找到file字段并修改文件名
            const fileEntry = result.formData.get('file');
            if (fileEntry && typeof fileEntry === 'object' && 'name' in fileEntry) {
              // 创建新的 File 对象，设置正确的文件名
              try {
                const newFile = new File([fileEntry], `audio.${extension}`, { 
                  type: options.mediaType 
                });
                result.formData.set('file', newFile);
              } catch (error) {
                console.log('Failed to create new File object:', error);
                // 如果创建新 File 对象失败，尝试其他方法
                // 在 Node.js 环境中，可能需要使用 Buffer 或其他方式
                if (fileEntry && typeof fileEntry === 'object' && 'arrayBuffer' in fileEntry) {
                  try {
                    const arrayBuffer = await (fileEntry as any).arrayBuffer();
                    const newFile = new File([arrayBuffer], `audio.${extension}`, { 
                      type: options.mediaType 
                    });
                    result.formData.set('file', newFile);
                    console.log('Created new file from arrayBuffer with name:', `audio.${extension}`);
                  } catch (bufferError) {
                    console.log('Failed to create file from arrayBuffer:', bufferError);
                  }
                }
              }
            }
          }
          return result;
        };
      }
    }
    
    return super.doGenerate(options);
  }
}

// 自定义 OpenAI 聊天模型类，修复空工具时的 tool_choice 问题
class AihubmixOpenAIChatLanguageModel extends OpenAIChatLanguageModel {
  constructor(modelId: string, settings: any) {
    super(modelId, {
      ...settings,
      fetch: AihubmixOpenAIChatLanguageModel.createCustomFetch(settings.fetch),
    });
  }

  private static createCustomFetch(originalFetch?: any) {
    return async (url: string, options: any) => {
      // 拦截请求并修复 tool_choice 问题
      if (options?.body) {
        try {
          const body = JSON.parse(options.body);
          if (body.tools && Array.isArray(body.tools) && body.tools.length === 0 && body.tool_choice) {
            delete body.tool_choice;
            options.body = JSON.stringify(body);
          }
        } catch (error) {
          // 如果解析失败，继续使用原始请求
        }
      }
      
      return originalFetch ? originalFetch(url, options) : fetch(url, options);
    };
  }
}export function createAihubmix(
  options: AihubmixProviderSettings = {},
): AihubmixProvider {
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'AIHUBMIX_API_KEY',
      description: 'Aihubmix',
    })}`,
    'APP-Code': 'WHVL9885',
    'Content-Type': 'application/json',
  });

  const getTranscriptionHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'AIHUBMIX_API_KEY',
      description: 'Aihubmix',
    })}`,
    'APP-Code': 'WHVL9885',
  });

  const url = ({ path, modelId }: { path: string; modelId: string }) => {
    const baseURL = 'https://aihubmix.com/v1';
    return `${baseURL}${path}`;
  };

  const createChatModel = (
    deploymentName: string,
    settings: OpenAIProviderSettings = {},
  ) => {
    const headers = getHeaders();
    if (deploymentName.startsWith('claude-')) {
      return new AnthropicMessagesLanguageModel(deploymentName, {
        provider: 'aihubmix.chat',
        baseURL: url({ path: '', modelId: deploymentName }),
        headers: {
          ...headers,
          'x-api-key': headers['Authorization'].split(' ')[1],
        },
        supportedUrls: () => ({
          'image/*': [/^https?:\/\/.*$/],
        }),
      });
    }
    if (
      (deploymentName.startsWith('gemini') ||
        deploymentName.startsWith('imagen')) &&
      !deploymentName.endsWith('-nothink') &&
      !deploymentName.endsWith('-search')
    ) {
      return new GoogleGenerativeAILanguageModel(
        deploymentName,
        {
          provider: 'aihubmix.chat',
          baseURL: 'https://aihubmix.com/gemini/v1beta',
          headers: {
            ...headers,
            'x-goog-api-key': headers['Authorization'].split(' ')[1],
          },
          generateId: () => `aihubmix-${Date.now()}`,
          supportedUrls: () => ({}),
        },
      );
    }

    if (deploymentName === "gpt-5-pro" || deploymentName === "gpt-5-codex") {
			return new OpenAIResponsesLanguageModel(deploymentName, {
				provider: 'aihubmix.chat',
				url,
				headers: getHeaders,
				fetch: options.fetch,
				fileIdPrefixes: ['file-'],
			});
		}

    return new AihubmixOpenAIChatLanguageModel(deploymentName, {
      provider: 'aihubmix.chat',
      url,
      headers: getHeaders,
      fetch: options.fetch,
    });
  };

  const createCompletionModel = (
    modelId: string,
    settings: any = {},
  ) =>
    new OpenAICompletionLanguageModel(modelId, {
      provider: 'aihubmix.completion',
      url,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const createEmbeddingModel = (
    modelId: string,
    settings: any = {},
  ) => {
    return new OpenAIEmbeddingModel(modelId, {
      provider: 'aihubmix.embeddings',
      headers: getHeaders,
      url,
      fetch: options.fetch,
    });
  };

  const createResponsesModel = (modelId: string) =>
    new OpenAIResponsesLanguageModel(modelId, {
      provider: 'aihubmix.responses',
      url,
      headers: getHeaders,
      fetch: options.fetch,
      fileIdPrefixes: ['file-'],
    });

  const createImageModel = (
    modelId: string,
    settings: any = {},
  ) => {
    return new OpenAIImageModel(modelId, {
      provider: 'aihubmix.image',
      url,
      headers: getHeaders,
      fetch: options.fetch,
    });
  };

  const createTranscriptionModel = (modelId: string) =>
    new AihubmixTranscriptionModel(modelId, {
      provider: 'aihubmix.transcription',
      url,
      headers: getTranscriptionHeaders,
      fetch: options.fetch,
    });
  const createSpeechModel = (modelId: string) =>
    new OpenAISpeechModel(modelId, {
      provider: 'aihubmix.speech',
      url,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const providerFn = function (
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ) {
    if (new.target) {
      throw new Error(
        'The Aihubmix model function cannot be called with the new keyword.',
      );
    }

    return createChatModel(deploymentId, settings);
  };

  // 创建带有所有必需属性的 provider 对象
  const provider = Object.assign(providerFn, {
    specificationVersion: 'v3' as const,
    languageModel: createChatModel,
    chat: createChatModel,
    completion: createCompletionModel,
    responses: createResponsesModel,
    embedding: createEmbeddingModel,
    embeddingModel: createEmbeddingModel,
    textEmbedding: createEmbeddingModel,
    textEmbeddingModel: createEmbeddingModel,
    image: createImageModel,
    imageModel: createImageModel,
    transcription: createTranscriptionModel,
    transcriptionModel: createTranscriptionModel,
    speech: createSpeechModel,
    speechModel: createSpeechModel,
    tools: aihubmixTools,
  });

  return provider as AihubmixProvider;
}

export const aihubmix = createAihubmix();
