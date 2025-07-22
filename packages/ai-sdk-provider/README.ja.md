# AI SDK - Aihubmix Provider

> **�� 10% 割引！**
app-codeが内蔵されており、この方法でモデルをリクエストすると10%割引になります。

**[Aihubmix 公式サイト](https://aihubmix.com/)** | **[モデルスクエア](https://aihubmix.com/models)**

[AI SDK](https://ai-sdk.dev/docs)用の **[Aihubmix provider](https://v5.ai-sdk.dev/providers/community-providers/aihubmix)**
一つのゲートウェイ、無限のモデル；ワンストップリクエスト：OpenAI、Claude、Gemini、DeepSeek、Qwen、そして500以上のAIモデル。

## サポートされている機能

Aihubmix providerは以下のAI機能をサポートしています：

- **テキスト生成**：様々なモデルでのチャット完了
- **ストリーミングテキスト**：リアルタイムテキストストリーミング
- **画像生成**：テキストプロンプトから画像を作成
- **埋め込み**：単一およびバッチテキスト埋め込み
- **オブジェクト生成**：スキーマを使用した構造化データ生成
- **ストリーミングオブジェクト**：リアルタイム構造化データストリーミング
- **音声合成**：テキストから音声への変換
- **転写**：音声からテキストへの変換
- **ツール**：ウェブ検索およびその他のツール

## セットアップ

Aihubmix providerは`@aihubmix/ai-sdk-provider`モジュールで利用可能です。[@aihubmix/ai-sdk-provider](https://www.npmjs.com/package/@aihubmix/ai-sdk-provider)でインストールできます

```bash
npm i @aihubmix/ai-sdk-provider
```

## Provider インスタンス

`@aihubmix/ai-sdk-provider`からデフォルトのproviderインスタンス`aihubmix`をインポートできます：

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
```

## 設定

Aihubmix APIキーを環境変数として設定：

```bash
export AIHUBMIX_API_KEY="your-api-key-here"
```

または直接providerに渡す：

```ts
import { createAihubmix } from '@aihubmix/ai-sdk-provider';

const aihubmix = createAihubmix({
  apiKey: 'your-api-key-here',
});
```

## 使用

まず、必要な関数をインポートします：

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

### テキスト生成

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('o4-mini'),
  prompt: '4人用のベジタリアンラザニアのレシピを書いてください。',
});
```

### Claudeモデル

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('claude-3-7-sonnet-20250219'),
  prompt: '簡単な言葉で量子コンピューティングを説明してください。',
});
```

### Geminiモデル

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('gemini-2.5-flash'),
  prompt: '数字のリストをソートするPythonスクリプトを作成してください。',
});
```

### 画像生成

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateImage } from 'ai';

const { image } = await generateImage({
  model: aihubmix.image('gpt-image-1'),
  prompt: '山々の上に美しい夕日',
});
```

### 埋め込み

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { embed } from 'ai';

const { embedding } = await embed({
  model: aihubmix.embedding('text-embedding-ada-002'),
  value: 'こんにちは、世界！',
});
```

### 転写

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { transcribe } from 'ai';

const { text } = await transcribe({
  model: aihubmix.transcription('whisper-1'),
  audio: audioFile,
});
```

### ストリーミングテキスト

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { streamText } from 'ai';

const result = streamText({
  model: aihubmix('gpt-3.5-turbo'),
  prompt: 'ロボットが絵を学ぶ短編小説を書いてください。',
  maxOutputTokens: 256,
  temperature: 0.3,
  maxRetries: 3,
});

let fullText = '';
for await (const textPart of result.textStream) {
  fullText += textPart;
  process.stdout.write(textPart);
}

console.log('\n使用量:', await result.usage);
console.log('完了理由:', await result.finishReason);
```

### オブジェクト生成

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
  prompt: 'ラザニアのレシピを生成してください。',
});

console.log(JSON.stringify(result.object.recipe, null, 2));
console.log('Token使用量:', result.usage);
console.log('完了理由:', result.finishReason);
```

### ストリーミングオブジェクト

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
  prompt: 'ラザニアのレシピを生成してください。',
});

for await (const objectPart of result.partialObjectStream) {
  console.log(objectPart);
}

console.log('Token使用量:', result.usage);
console.log('最終オブジェクト:', result.object);
```

### バッチ埋め込み

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { embedMany } from 'ai';

const { embeddings, usage } = await embedMany({
  model: aihubmix.embedding('text-embedding-3-small'),
  values: [
    'ビーチでの晴れた日',
    '街での雨の午後',
    '山での雪の夜',
  ],
});

console.log('埋め込み:', embeddings);
console.log('使用量:', usage);
```

### 音声合成

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateSpeech } from 'ai';

const { audio } = await generateSpeech({
  model: aihubmix.speech('tts-1'),
  text: 'こんにちは、これは音声合成のテストです。',
});

// 音声ファイルを保存
await saveAudioFile(audio);
console.log('音声生成成功:', audio);
```

### ツール

Aihubmix providerはウェブ検索を含む様々なツールをサポートしています：

```ts
import { aihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: aihubmix('gpt-4'),
  prompt: 'AIの最新の進歩は何ですか？',
  tools: {
    webSearchPreview: aihubmix.tools.webSearchPreview({
      searchContextSize: 'high',
    }),
  },
});
```

## 追加リソース

- [Aihubmix Provider リポジトリ](https://github.com/inferera/aihubmix)
- [Aihubmix ドキュメント](https://docs.aihubmix.com/en)
- [Aihubmix ダッシュボード](https://aihubmix.com)
- [Aihubmix ビジネス協力](mailto:business@aihubmix.com)