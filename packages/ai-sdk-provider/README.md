# AI SDK - Aihubmix Provider

> **🎉 10% discount!**
Added app-code; this way, requesting all models through ai-sdk offers a 10% discount.

**[Aihubmix Official Website](https://aihubmix.com/)** | **[Model Square](https://aihubmix.com/models)**

The **[Aihubmix provider](https://ai-sdk.dev/providers/ai-sdk-providers/aihubmix)** for the [AI SDK](https://ai-sdk.dev/docs)
One Gateway, Infinite Models；one-stop request: OpenAI, Claude, Gemini, DeepSeek, Qwen, and over 500 AI models.

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

## Supported Models

### OpenAI-Compatible Models

- GPT-4, GPT-3.5, and other OpenAI models
- Image generation models
- Embedding models
- Transcription models
- Speech synthesis models

### Anthropic Claude Models

- Claude-3 models (claude-3-opus, claude-3-sonnet, claude-3-haiku)
- Claude-2 models

### Google Gemini Models

- Gemini Pro models
- Gemini Flash models
- Imagen models

### Other Models => [Model Square](https://aihubmix.com/models)

## Examples

### Chat Completion

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

## Tools

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

## Documentation

Please check out the **[Aihubmix provider documentation](https://ai-sdk.dev/providers/ai-sdk-providers/aihubmix)** for more information.