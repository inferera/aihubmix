# AI SDK - Aihubmix Provider

<div align="center">
  <a href="README.md">🇺🇸 English</a> | 
  <a href="README.zh.md">🇨🇳 中文</a> | 
  <a href="README.ja.md">🇯🇵 日本語</a>
</div>

> **🎉 10% discount!**
Built-in app-code; using this method to request all models offers a 10% discount.

**[Aihubmix Official Website](https://aihubmix.com/)** | **[Model Square](https://aihubmix.com/models)**

The **[Aihubmix provider](https://sdk.vercel.ai/providers/community-providers/aihubmix)** for the [AI SDK](https://ai-sdk.dev/docs)
One Gateway, Infinite Models；one-stop request: OpenAI, Claude, Gemini, DeepSeek, Qwen, and over 500 AI models.

> **📦 Version 1.0.1** - Compatible with AI SDK v6


## Supported Features

The Aihubmix provider supports the following AI features:

- **Text Generation**: Chat completion with various models
- **Streaming Text**: Real-time text streaming
- **Image Generation**: Create images from text prompts
- **Embeddings**: Single and batch text embeddings
- **Object Generation**: Structured data generation with schemas
- **Streaming Objects**: Real-time structured data streaming
- **Speech Synthesis**: Text-to-speech conversion
- **Transcription**: Speech-to-text conversion
- **Tools**: Web search and other tools


## Setup

The Aihubmix provider is available in the `@aihubmix/ai-sdk-provider` module. You can install it with [@aihubmix/ai-sdk-provider](https://www.npmjs.com/package/@aihubmix/ai-sdk-provider)

```bash
npm i @aihubmix/ai-sdk-provider
```

## Provider Instance

You can import the default provider instance `aihubmix` from `@aihubmix/ai-sdk-provider`:

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
```

## Configuration

Set your Aihubmix API key as an environment variable:

```bash
export AIHUBMIX_API_KEY="your-api-key-here"
```

Or pass it directly to the provider:

```ts
import { createAihubmix } from '@aihubmix/ai-sdk-provider';

const aihubmix = createAihubmix({
  apiKey: 'your-api-key-here',
});
```

## Usage

First, import the necessary functions:

```ts
import { createAihubmix } from '@aihubmix/ai-sdk-provider';
import { 
  generateText, 
  streamText, 
  experimental_generateImage as generateImage, 
  embed, 
  embedMany, 
  generateObject, 
  streamObject, 
  experimental_generateSpeech as generateSpeech, 
  experimental_transcribe as transcribe 
} from 'ai';
import { z } from 'zod';
```

> **Note**: Some APIs like `generateImage`, `generateSpeech`, and `transcribe` are still experimental in AI SDK v6.

### Generate Text

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('o4-mini'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

### Claude Model

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('claude-3-7-sonnet-20250219'),
  prompt: 'Explain quantum computing in simple terms.',
});
```

### Gemini Model

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('gemini-2.5-flash'),
  prompt: 'Create a Python script to sort a list of numbers.',
});
```

### Image Generation

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateImage } from 'ai';

const { image } = await generateImage({
  model: aihubmix.image('gpt-image-1'),
  prompt: 'A beautiful sunset over mountains',
});
```

### Embeddings

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { embed } from 'ai';

const { embedding } = await embed({
  model: aihubmix.embedding('text-embedding-ada-002'),
  value: 'Hello, world!',
});
```

### Transcription

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { transcribe } from 'ai';

const { text } = await transcribe({
  model: aihubmix.transcription('whisper-1'),
  audio: audioFile,
});
```

### Stream Text

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { streamText } from 'ai';

const result = streamText({
  model: aihubmix('gpt-3.5-turbo'),
  prompt: 'Write a short story about a robot learning to paint.',
  maxOutputTokens: 256,
  temperature: 0.3,
  maxRetries: 3,
});

let fullText = '';
for await (const textPart of result.textStream) {
  fullText += textPart;
  process.stdout.write(textPart);
}

console.log('\nUsage:', await result.usage);
console.log('Finish reason:', await result.finishReason);
```

### Generate Object

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateObject } from 'ai';
import { z } from 'zod';

const result = await generateObject({
  model: aihubmix('gpt-4o-mini'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

console.log(JSON.stringify(result.object.recipe, null, 2));
console.log('Token usage:', result.usage);
console.log('Finish reason:', result.finishReason);
```

### Stream Object

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = await streamObject({
  model: aihubmix('gpt-4o-mini'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const objectPart of result.partialObjectStream) {
  console.log(objectPart);
}

console.log('Token usage:', result.usage);
console.log('Final object:', result.object);
```

### Embed Many

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { embedMany } from 'ai';

const { embeddings, usage } = await embedMany({
  model: aihubmix.embedding('text-embedding-3-small'),
  values: [
    'sunny day at the beach',
    'rainy afternoon in the city',
    'snowy night in the mountains',
  ],
});

console.log('Embeddings:', embeddings);
console.log('Usage:', usage);
```

### Speech Synthesis

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateSpeech } from 'ai';

const { audio } = await generateSpeech({
  model: aihubmix.speech('tts-1'),
  text: 'Hello, this is a test for speech synthesis.',
});

// Save the audio file
await saveAudioFile(audio);
console.log('Audio generated successfully:', audio);
```

### Tools

The Aihubmix provider supports various tools including web search:

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('gpt-4'),
  prompt: 'What are the latest developments in AI?',
  tools: {
    webSearchPreview: aihubmix.tools.webSearchPreview({
      searchContextSize: 'high',
    }),
  },
});
```


## Additional Resources

- [Aihubmix Provider Repository](https://github.com/inferera/aihubmix)
- [Aihubmix Documentation](https://docs.aihubmix.com/en)
- [Aihubmix Dashboard](https://aihubmix.com)
- [Aihubmix Cooperation](mailto:business@aihubmix.com)