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
  EmbeddingModelV2,
  LanguageModelV2,
  ProviderV2,
  ImageModelV2,
  TranscriptionModelV2,
  SpeechModelV2,
  TranscriptionModelV2CallOptions,
} from '@ai-sdk/provider';
import { FetchFunction, loadApiKey } from '@ai-sdk/provider-utils';
import { aihubmixTools } from './aihubmix-tools';

// 导入设置类型
import type { OpenAIProviderSettings } from '@ai-sdk/openai';


export interface AihubmixProvider extends ProviderV2 {
  (deploymentId: string, settings?: OpenAIProviderSettings): LanguageModelV2;

  languageModel(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): LanguageModelV2;

  chat(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): LanguageModelV2;

  responses(deploymentId: string): LanguageModelV2;

  completion(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): LanguageModelV2;

  embedding(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): EmbeddingModelV2<string>;

  image(deploymentId: string, settings?: OpenAIProviderSettings): ImageModelV2;

  imageModel(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): ImageModelV2;

  textEmbedding(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): EmbeddingModelV2<string>;

  textEmbeddingModel(
    deploymentId: string,
    settings?: OpenAIProviderSettings,
  ): EmbeddingModelV2<string>;

  transcription(deploymentId: string): TranscriptionModelV2;

  speech(deploymentId: string): SpeechModelV2;

  speechModel(deploymentId: string): SpeechModelV2;

  tools: typeof aihubmixTools;
}

export interface AihubmixProviderSettings {
  apiKey?: string;
  fetch?: FetchFunction;
  compatibility?: 'strict' | 'compatible';
}

class AihubmixTranscriptionModel extends OpenAITranscriptionModel {
  async doGenerate(options: TranscriptionModelV2CallOptions) {
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

export function createAihubmix(
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

    return new OpenAIChatLanguageModel(deploymentName, {
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
  const provider = function (
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

  provider.languageModel = createChatModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;
  provider.responses = createResponsesModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;

  provider.image = createImageModel;
  provider.imageModel = createImageModel;

  provider.transcription = createTranscriptionModel;
  provider.transcriptionModel = createTranscriptionModel;

  provider.speech = createSpeechModel;
  provider.speechModel = createSpeechModel;

  provider.tools = aihubmixTools;

  return provider as AihubmixProvider;
}

export const aihubmix = createAihubmix();
