import 'dotenv/config';
import { createAihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText, streamText, experimental_generateImage as generateImage, embed, experimental_generateSpeech as generateSpeech, experimental_transcribe as transcribe, streamObject, embedMany, generateObject } from 'ai';
import { readFile } from 'fs/promises';
import { z } from 'zod';
import { presentImages } from '../lib/present-image';
import { saveAudioFile } from '../lib/save-audio';

console.log('🚀 开始执行 Aihubmix AI SDK Provider 测试套件\n');

// 测试配置
const testConfig = {
  generateText: {
    model: 'gpt-4o-mini',
    prompt: 'Invent a new holiday and describe its traditions.',
  },
  streamText: {
    model: 'gpt-3.5-turbo',
    prompt: 'Invent a new holiday and describe its traditions.',
  },
  generateImage: {
    model: 'dall-e-3',
    prompt: 'A cute cat sitting in a garden',
  },
  generateSpeech: {
    model: 'tts-1',
    text: 'Hello, this is a test for speech synthesis.',
  },
  generateObject: {
    model: 'gpt-4o-mini',
    prompt: 'Generate a lasagna recipe.',
  },
  streamObject: {
    model: 'gpt-4o-mini',
    prompt: 'Generate a lasagna recipe.',
  },
  embed: {
    model: 'text-embedding-3-small',
    value: 'This is a test text for embedding.',
  },
  embedMany: {
    model: 'text-embedding-3-small',
    values: [
      'sunny day at the beach',
      'rainy afternoon in the city',
      'snowy night in the mountains',
    ],
  },
  transcribe: {
    model: 'whisper-1',
    audio: await readFile('./data/galileo.mp3'),
  },
};

// 测试结果类型
interface TestResult {
  name: string;
  success: boolean;
  duration: number;
}

const aihubmix = createAihubmix({
  apiKey: process.env.AIHUBMIX_API_KEY,
});

// 测试函数
async function testGenerateText(): Promise<boolean> {
  console.log('📝 测试 generateText...');
  try {
    const { text, usage } = await generateText({
      model: aihubmix(testConfig.generateText.model),
      prompt: testConfig.generateText.prompt,
    });
    console.log('✅ generateText 测试成功');
    console.log('📄 生成文本:', text.substring(0, 100) + '...');
    console.log('📊 使用情况:', usage);
    return true;
  } catch (error) {
    console.log('❌ generateText 测试失败:', (error as Error).message);
    return false;
  }
}

async function testGenerateObject(): Promise<boolean> {
  console.log('\n🌊 测试 generateObject...');
  try {
    const result = await generateObject({
      model: aihubmix(testConfig.generateObject.model),
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
      prompt: testConfig.generateObject.prompt,
    });
  
    console.log(JSON.stringify(result.object.recipe, null, 2));
    console.log();
    console.log('Token usage:', result.usage);
    console.log('Finish reason:', result.finishReason);
    return true;
  } catch (error) {
    console.log('❌ generateObject 测试失败:', (error as Error).message);
    return false;
  }
}

async function testStreamText(): Promise<boolean> {
  console.log('\n🌊 测试 streamText...');
  try {
    const result = streamText({
      model: aihubmix(testConfig.streamText.model),
      prompt: testConfig.streamText.prompt,
      maxTokens: 256,
      temperature: 0.3,
      maxRetries: 3,
    });

    let fullText = '';
    for await (const textPart of result.textStream) {
      fullText += textPart;
      process.stdout.write(textPart);
    }

    console.log('\n✅ streamText 测试成功');
    console.log('📊 使用情况:', await result.usage);
    console.log('🏁 完成原因:', await result.finishReason);
    return true;
  } catch (error) {
    console.log('\n❌ streamText 测试失败:', (error as Error).message);
    return false;
  }
}

async function testStreamObject(): Promise<boolean> {
  console.log('\n🌊 测试 streamObject...');
  try {
    const result = await streamObject({
      model: aihubmix(testConfig.streamObject.model),
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
    console.log('Object:', result.object);
    return true;
  } catch (error) {
    console.log('❌ streamObject 测试失败:', (error as Error).message);
    return false;
  }
}

async function testGenerateImage(): Promise<boolean> {
  console.log('\n🎨 测试 generateImage...');
  try {
    const { image } = await generateImage({
      model: aihubmix.image(testConfig.generateImage.model),
      prompt: testConfig.generateImage.prompt,
    });
    await presentImages([image]);

    console.log('✅ generateImage 测试成功');
    console.log('🖼️ 图片 URL:', image);
    return true;
  } catch (error) {
    console.log('❌ generateImage 测试失败:', (error as Error).message);
    return false;
  }
}

async function testEmbed(): Promise<boolean> {
  console.log('\n🔗 测试 embed...');
  try {
    const { embedding, usage } = await embed({
      model: aihubmix.embedding(testConfig.embed.model),
      value: testConfig.embed.value,
    });
    console.log('✅ embed 测试成功');
    console.log('📊 嵌入维度:', embedding.length);
    console.log('📊 使用情况:', usage);
    return true;
  } catch (error) {
    console.log('❌ embed 测试失败:', (error as Error).message);
    return false;
  }
}

async function testEmbedMany(): Promise<boolean> {
  console.log('\n🔗 测试 embedMany...');
  try {
    const { embeddings, usage } = await embedMany({
      model: aihubmix.embedding(testConfig.embedMany.model),
      values: [
        'sunny day at the beach',
        'rainy afternoon in the city',
        'snowy night in the mountains',
      ],
    });
  
    console.log(embeddings);
    console.log(usage);
    return true;
  } catch (error) {
    console.log('❌ embedMany 测试失败:', (error as Error).message);
    return false;
  }
}

async function testGenerateSpeech(): Promise<boolean> {
  console.log('\n🎤 测试 generateSpeech...');
  try {
    const { audio } = await generateSpeech({
      model: aihubmix.speech(testConfig.generateSpeech.model),
      text: testConfig.generateSpeech.text,
    });
    await saveAudioFile(audio);
    console.log('✅ generateSpeech 测试成功', audio);
    console.log('🎵 音频生成成功');
    return true;
  } catch (error) {
    console.log('❌ generateSpeech 测试失败:', (error as Error).message);
    return false;
  }
}

async function testTranscribe(): Promise<boolean> {
  console.log('\n🎧 测试 transcribe...');
  try {
    const {text, durationInSeconds} = await transcribe({
      model: aihubmix.transcription(testConfig.transcribe.model),
        audio: testConfig.transcribe.audio,
    });
  
    console.log('✅ transcribe 测试成功', text);
    console.log('🎵 音频时长:', durationInSeconds);
    return true;
  } catch (error) {
    console.log('❌ transcribe 测试失败:', (error as Error).message);
    return false;
  }
}

async function testWorkspaceDependency(): Promise<boolean> {
  console.log('\n🔗 测试 workspace 依赖...');
  try {
    console.log('✅ Workspace dependency test successful!');
    console.log('AI SDK Provider loaded:', typeof aihubmix);
    console.log('createAihubmix function available:', typeof aihubmix);
    return true;
  } catch (error) {
    console.log('❌ workspace 依赖测试失败:', (error as Error).message);
    return false;
  }
}

// 主测试函数
async function runAllTests(): Promise<boolean> {
  const tests = [
    { name: 'Workspace 依赖', fn: testWorkspaceDependency },
    { name: 'Generate Text', fn: testGenerateText },
    { name: 'Stream Text', fn: testStreamText },
    { name: 'Generate Image', fn: testGenerateImage },
    { name: 'Generate Speech', fn: testGenerateSpeech },
    { name: 'Generate Object', fn: testGenerateObject },
    { name: 'Stream Object', fn: testStreamObject },
    { name: 'Embed', fn: testEmbed },
    { name: 'Embed Many', fn: testEmbedMany },
    { name: 'Transcribe', fn: testTranscribe },
  ];

  const results: TestResult[] = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 执行测试: ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    const startTime = Date.now();
    const success = await test.fn();
    const endTime = Date.now();
    
    results.push({
      name: test.name,
      success,
      duration: endTime - startTime,
    });
  }

  // 输出测试结果摘要
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 测试结果摘要');
  console.log(`${'='.repeat(60)}`);
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name} (${result.duration}ms)`);
  });
  
  console.log(`\n🎯 总体结果: ${passed}/${total} 测试通过`);
  
  if (passed === total) {
    console.log('🎉 所有测试都通过了！');
  } else {
    console.log('⚠️ 部分测试失败，请检查错误信息');
  }
  
  return passed === total;
}

// 执行所有测试
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ 测试执行过程中发生错误:', error);
    process.exit(1);
  });
