import {
  EmbeddingModelV2Embedding,
  LanguageModelV2Prompt,
} from '@ai-sdk/provider';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createAihubmix } from './aihubmix-provider';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

const TEST_PROMPT: LanguageModelV2Prompt = [
  { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
];

const provider = createAihubmix({
  apiKey: 'test-api-key',
});

// Store request info for assertions
let lastRequest: {
  url: string;
  headers: Record<string, string>;
  body: any;
} | null = null;

// MSW handlers
const handlers = [
  http.post('https://aihubmix.com/v1/chat/completions', async ({ request }) => {
    lastRequest = {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.json(),
    };
    return HttpResponse.json({
      id: 'chatcmpl-95ZTZkhr0mHNKqerQfiwkuox3PHAd',
      object: 'chat.completion',
      created: 1711115037,
      model: 'gpt-4o',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello from GPT-4o!',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 4,
        total_tokens: 34,
        completion_tokens: 30,
      },
      system_fingerprint: 'fp_3bc1b5746c',
    });
  }),

  http.post('https://aihubmix.com/v1/completions', async ({ request }) => {
    lastRequest = {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.json(),
    };
    return HttpResponse.json({
      id: 'cmpl-96cAM1v77r4jXa4qb2NSmRREV5oWB',
      object: 'text_completion',
      created: 1711363706,
      model: 'gpt-35-turbo-instruct',
      choices: [
        {
          text: 'Generated completion text',
          index: 0,
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 4,
        total_tokens: 34,
        completion_tokens: 30,
      },
    });
  }),

  http.post('https://aihubmix.com/v1/embeddings', async ({ request }) => {
    lastRequest = {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.json(),
    };
    return HttpResponse.json({
      object: 'list',
      data: [
        { object: 'embedding', embedding: [0.1, 0.2, 0.3, 0.4, 0.5], index: 0 },
        { object: 'embedding', embedding: [0.6, 0.7, 0.8, 0.9, 1.0], index: 1 },
      ],
      model: 'text-embedding-ada-002',
      usage: {
        prompt_tokens: 8,
        total_tokens: 8,
      },
    });
  }),

  http.post(
    'https://aihubmix.com/v1/images/generations',
    async ({ request }) => {
      lastRequest = {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.json(),
      };
      return HttpResponse.json({
        created: 1711115037,
        data: [
          {
            url: 'https://example.com/image.png',
            revised_prompt: 'A beautiful sunset',
            b64_json: 'base64-encoded-image-data',
          },
        ],
      });
    },
  ),

  http.post(
    'https://aihubmix.com/v1/audio/transcriptions',
    async ({ request }) => {
      lastRequest = {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: null,
      };
      return HttpResponse.json({
        text: 'Hello, this is a test transcription.',
      });
    },
  ),

  http.post('https://aihubmix.com/v1/audio/speech', async ({ request }) => {
    lastRequest = {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.json(),
    };
    return new HttpResponse(
      new Uint8Array([
        98, 97, 115, 101, 54, 52, 45, 101, 110, 99, 111, 100, 101, 100, 45, 97,
        117, 100, 105, 111, 45, 100, 97, 116, 97,
      ]),
      {
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      },
    );
  }),

  http.post('https://aihubmix.com/v1/messages', async ({ request }) => {
    lastRequest = {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.json(),
    };
    return HttpResponse.json({
      id: 'msg_123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'Hello from Claude!',
        },
      ],
      model: 'claude-3-sonnet-20240229',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 4,
        output_tokens: 30,
      },
    });
  }),

  http.post(
    'https://aihubmix.com/gemini/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent',
    async ({ request }) => {
      lastRequest = {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.json(),
      };
      return HttpResponse.json({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Hello from Gemini!',
                },
              ],
            },
            finishReason: 'STOP',
            index: 0,
            safetyRatings: [],
          },
        ],
        promptFeedback: {
          safetyRatings: [],
        },
      });
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  lastRequest = null;
});

describe('aihubmix provider', () => {
  describe('chat models', () => {
    describe('OpenAI models', () => {
      it('should handle OpenAI models correctly', async () => {
        const result = await provider('gpt-4o').doGenerate({
          prompt: TEST_PROMPT,
        });

        expect(
          (result.content[0] as { type: 'text'; text: string }).text,
        ).toStrictEqual('Hello from GPT-4o!');
      });

      it('should pass correct headers for OpenAI models', async () => {
        await provider('gpt-4o').doGenerate({
          prompt: TEST_PROMPT,
          headers: {
            'Custom-Request-Header': 'request-header-value',
          },
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['content-type']).toBe('application/json');
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['custom-request-header']).toBe(
          'request-header-value',
        );
      });
    });

    describe('Claude models', () => {
      it('should handle Claude models correctly', async () => {
        const result = await provider('claude-3-sonnet-20240229').doGenerate({
          prompt: TEST_PROMPT,
        });

        expect(
          (result.content[0] as { type: 'text'; text: string }).text,
        ).toStrictEqual('Hello from Claude!');
      });

      it('should pass correct headers for Claude models', async () => {
        await provider('claude-3-sonnet-20240229').doGenerate({
          prompt: TEST_PROMPT,
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['content-type']).toBe('application/json');
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['x-api-key']).toBe('test-api-key');
      });
    });

    describe('Gemini models', () => {
      it('should handle Gemini models correctly', async () => {
        const result = await provider(
          'gemini-2.5-pro-preview-05-06',
        ).doGenerate({
          prompt: TEST_PROMPT,
        });

        expect(
          (result.content[0] as { type: 'text'; text: string }).text,
        ).toStrictEqual('Hello from Gemini!');
      });

      it('should pass correct headers for Gemini models', async () => {
        await provider('gemini-2.5-pro-preview-05-06').doGenerate({
          prompt: TEST_PROMPT,
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['content-type']).toBe('application/json');
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['x-goog-api-key']).toBe('test-api-key');
      });
    });
  });

  describe('completion', () => {
    describe('doGenerate', () => {
      it('should pass headers', async () => {
        const testProvider = createAihubmix({
          apiKey: 'test-api-key',
        });

        await testProvider.completion('gpt-35-turbo-instruct').doGenerate({
          prompt: TEST_PROMPT,
          headers: {
            'Custom-Request-Header': 'request-header-value',
          },
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['content-type']).toBe('application/json');
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['custom-request-header']).toBe(
          'request-header-value',
        );
      });

      it('should generate completion text', async () => {
        const result = await provider
          .completion('gpt-35-turbo-instruct')
          .doGenerate({
            prompt: TEST_PROMPT,
          });

        expect(
          (result.content[0] as { type: 'text'; text: string }).text,
        ).toStrictEqual('Generated completion text');
      });
    });
  });

  describe('embedding', () => {
    const dummyEmbeddings = [
      [0.1, 0.2, 0.3, 0.4, 0.5],
      [0.6, 0.7, 0.8, 0.9, 1.0],
    ];
    const testValues = ['sunny day at the beach', 'rainy day in the city'];

    describe('doEmbed', () => {
      const model = provider.embedding('text-embedding-ada-002');

      it('should pass headers', async () => {
        const testProvider = createAihubmix({
          apiKey: 'test-api-key',
        });

        await testProvider.embedding('text-embedding-ada-002').doEmbed({
          values: testValues,
          headers: { 'Custom-Request-Header': 'request-header-value' },
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['content-type']).toBe('application/json');
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['custom-request-header']).toBe(
          'request-header-value',
        );
      });

      it('should generate embeddings', async () => {
        const { embeddings } = await model.doEmbed({
          values: testValues,
        });

        expect(embeddings).toStrictEqual(dummyEmbeddings);
      });
    });
  });

  describe('image generation', () => {
    describe('doGenerate', () => {
      it('should generate images', async () => {
        const { images } = await provider.image('dall-e-3').doGenerate({
          prompt: 'A beautiful sunset',
          n: 1,
          size: '1024x1024',
          aspectRatio: '1:1',
          seed: 123,
          providerOptions: {},
        });

        expect(images).toStrictEqual(['base64-encoded-image-data']);
      });
    });
  });

  describe('provider configuration', () => {
    it('should handle missing API key', () => {
      // This should throw an error when no API key is provided
      expect(() => {
        createAihubmix({});
      }).not.toThrow(); // The provider should handle missing API key gracefully
    });
  });

  describe('transcription', () => {
    describe('doGenerate', () => {
      it('should pass headers', async () => {
        await provider.transcription('whisper-1').doGenerate({
          audio: new Uint8Array(8),
          mediaType: 'audio/wav',
          headers: { 'Custom-Request-Header': 'request-header-value' },
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['custom-request-header']).toBe(
          'request-header-value',
        );
      });

      it('should transcribe audio', async () => {
        const { text } = await provider.transcription('whisper-1').doGenerate({
          audio: new Uint8Array(8),
          mediaType: 'audio/wav',
        });

        expect(text).toStrictEqual('Hello, this is a test transcription.');
      });
    });
  });

  describe('speech', () => {
    describe('doGenerate', () => {
      it('should pass headers', async () => {
        await provider.speech('tts-1').doGenerate({
          text: 'Hello, world!',
          voice: 'alloy',
          headers: { 'Custom-Request-Header': 'request-header-value' },
        });

        expect(lastRequest?.headers['authorization']).toBe(
          'Bearer test-api-key',
        );
        expect(lastRequest?.headers['content-type']).toBe('application/json');
        expect(lastRequest?.headers['app-code']).toBe('WHVL9885');
        expect(lastRequest?.headers['custom-request-header']).toBe(
          'request-header-value',
        );
      });

      it('should generate speech audio', async () => {
        const { audio } = await provider.speech('tts-1').doGenerate({
          text: 'Hello, world!',
          voice: 'alloy',
        });

        expect(audio).toBeInstanceOf(Uint8Array);
        expect(audio.length).toBeGreaterThan(0);
      });
    });
  });

  describe('provider methods', () => {
    it('should have all required methods', () => {
      expect(provider.languageModel).toBeDefined();
      expect(provider.chat).toBeDefined();
      expect(provider.completion).toBeDefined();
      expect(provider.responses).toBeDefined();
      expect(provider.embedding).toBeDefined();
      expect(provider.textEmbedding).toBeDefined();
      expect(provider.textEmbeddingModel).toBeDefined();
      expect(provider.image).toBeDefined();
      expect(provider.imageModel).toBeDefined();
      expect(provider.transcription).toBeDefined();
      expect(provider.speech).toBeDefined();
      expect(provider.speechModel).toBeDefined();
      expect(provider.tools).toBeDefined();
    });

    it('should not allow new keyword', () => {
      expect(() => {
        new (provider as any)('gpt-4o');
      }).toThrow(
        'The Aihubmix model function cannot be called with the new keyword.',
      );
    });
  });
});
