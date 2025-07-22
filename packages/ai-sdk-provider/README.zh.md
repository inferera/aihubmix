# AI SDK - Aihubmix Provider

<div align="center">
  <a href="README.md">🇺🇸 English</a> | 
  <a href="README.zh.md">🇨🇳 中文</a> | 
  <a href="README.ja.md">🇯🇵 日本語</a>
</div>

> **🎉 10% 折扣！**
已内置app-code，使用此方式请求所有模型可享受 10% 折扣。

**[Aihubmix 官方网站](https://aihubmix.com/)** | **[模型广场](https://aihubmix.com/models)**

**[Aihubmix provider](https://v5.ai-sdk.dev/providers/community-providers/aihubmix)** 适用于 [AI SDK](https://ai-sdk.dev/docs)
一个网关，无限模型；一站式请求：OpenAI、Claude、Gemini、DeepSeek、Qwen 以及超过 500 个 AI 模型。

## 支持的功能

Aihubmix provider 支持以下 AI 功能：

- **文本生成**：使用各种模型进行聊天完成
- **流式文本**：实时文本流式传输
- **图像生成**：从文本提示创建图像
- **嵌入**：单个和批量文本嵌入
- **对象生成**：使用模式的结构化数据生成
- **流式对象**：实时结构化数据流式传输
- **语音合成**：文本转语音转换
- **转录**：语音转文本转换
- **工具**：网络搜索和其他工具

## 安装

Aihubmix 在 `@aihubmix/ai-sdk-provider` 模块中可用。您可以通过 [@aihubmix/ai-sdk-provider](https://www.npmjs.com/package/@aihubmix/ai-sdk-provider) 安装它

```bash
npm i @aihubmix/ai-sdk-provider
```

## Provider 实例

您可以从 `@aihubmix/ai-sdk-provider` 导入默认的 provider 实例 `aihubmix`：

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
```

## 配置

将您的 Aihubmix API 密钥设置为环境变量：

```bash
export AIHUBMIX_API_KEY="your-api-key-here"
```

或直接传递给 provider：

```ts
import { createAihubmix } from '@aihubmix/ai-sdk-provider';

const aihubmix = createAihubmix({
  apiKey: 'your-api-key-here',
});
```

## 使用

首先，导入必要的函数：

```ts
import { createAihubmix } from '@aihubmix/ai-sdk-provider';
import { 
  generateText, 
  streamText, 
  generateImage, 
  embed, 
  embedMany, 
  generateObject, 
  streamObject, 
  generateSpeech, 
  transcribe 
} from 'ai';
import { z } from 'zod';
```

### 生成文本

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('o4-mini'),
  prompt: '为4个人写一个素食千层面食谱。',
});
```

### Claude 模型

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('claude-3-7-sonnet-20250219'),
  prompt: '用简单的术语解释量子计算。',
});
```

### Gemini 模型

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('gemini-2.5-flash'),
  prompt: '创建一个Python脚本来对数字列表进行排序。',
});
```

### 图像生成

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateImage } from 'ai';

const { image } = await generateImage({
  model: aihubmix.image('gpt-image-1'),
  prompt: '山间美丽的日落',
});
```

### 嵌入

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { embed } from 'ai';

const { embedding } = await embed({
  model: aihubmix.embedding('text-embedding-ada-002'),
  value: '你好，世界！',
});
```

### 转录

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { transcribe } from 'ai';

const { text } = await transcribe({
  model: aihubmix.transcription('whisper-1'),
  audio: audioFile,
});
```

### 流式文本

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { streamText } from 'ai';

const result = streamText({
  model: aihubmix('gpt-3.5-turbo'),
  prompt: '写一个关于机器人学习绘画的短故事。',
  maxOutputTokens: 256,
  temperature: 0.3,
  maxRetries: 3,
});

let fullText = '';
for await (const textPart of result.textStream) {
  fullText += textPart;
  process.stdout.write(textPart);
}

console.log('\n使用情况:', await result.usage);
console.log('完成原因:', await result.finishReason);
```

### 生成对象

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
  prompt: '生成一个千层面食谱。',
});

console.log(JSON.stringify(result.object.recipe, null, 2));
console.log('Token使用情况:', result.usage);
console.log('完成原因:', result.finishReason);
```

### 流式对象

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
  prompt: '生成一个千层面食谱。',
});

for await (const objectPart of result.partialObjectStream) {
  console.log(objectPart);
}

console.log('Token使用情况:', result.usage);
console.log('最终对象:', result.object);
```

### 批量嵌入

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { embedMany } from 'ai';

const { embeddings, usage } = await embedMany({
  model: aihubmix.embedding('text-embedding-3-small'),
  values: [
    '海滩上的晴天',
    '城市里的雨天下午',
    '山间的雪夜',
  ],
});

console.log('嵌入向量:', embeddings);
console.log('使用情况:', usage);
```

### 语音合成

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateSpeech } from 'ai';

const { audio } = await generateSpeech({
  model: aihubmix.speech('tts-1'),
  text: '你好，这是语音合成的测试。',
});

// 保存音频文件
await saveAudioFile(audio);
console.log('音频生成成功:', audio);
```

### 工具

Aihubmix provider 支持各种工具，包括网络搜索：

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('gpt-4'),
  prompt: 'AI的最新发展是什么？',
  tools: {
    webSearchPreview: aihubmix.tools.webSearchPreview({
      searchContextSize: 'high',
    }),
  },
});
```

## 附加资源

- [Aihubmix Provider 仓库](https://github.com/inferera/aihubmix)
- [Aihubmix 文档](https://docs.aihubmix.com/en)
- [Aihubmix 控制台](https://aihubmix.com)
- [Aihubmix 商务合作](mailto:business@aihubmix.com) 
