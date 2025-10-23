import 'dotenv/config';
import { createAihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

// 确保加载正确的 .env 文件
dotenv.config({ path: '../.env' });

console.log('🚀 开始执行指定模型的 generateText 测试\n');

// 需要测试的模型列表
const modelsToTest = [
  'gpt-5',
  'gpt-5-codex', 
  'gpt-5-pro',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-5-chat-latest',
  'sora-2-pro',
  'sora-2',
  'gpt-4o-mini-audio-preview',
  'o3'
];

// 测试配置
const testConfig = {
  prompt: 'Hello, please respond with a simple greeting and tell me what model you are.',
  maxTokens: 100,
  temperature: 0.7,
};

// 测试结果类型
interface TestResult {
  model: string;
  success: boolean;
  duration: number;
  response?: string;
  error?: string;
  usedResponseAPI?: boolean;
}

const aihubmix = createAihubmix({
  apiKey: process.env.AIHUBMIX_API_KEY,
});

// 测试单个模型的 generateText 函数
async function testModelGenerateText(model: string): Promise<TestResult> {
  console.log(`📝 测试模型: ${model}`);
  const startTime = Date.now();
  
  try {
    // 检查是否是使用 response API 的模型
    const usesResponseAPI = model === 'gpt-5-pro' || model === 'gpt-5-codex';
    
    if (usesResponseAPI) {
      console.log(`🔍 模型 ${model} 应该使用 response API`);
    }
    
    const { text, usage, finishReason } = await generateText({
      model: aihubmix(model),
      prompt: testConfig.prompt,
      maxTokens: testConfig.maxTokens,
      temperature: testConfig.temperature,
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ 模型 ${model} 测试成功`);
    console.log(`📄 响应文本: ${text.substring(0, 150)}${text.length > 150 ? '...' : ''}`);
    console.log(`📊 使用情况:`, usage);
    console.log(`🏁 完成原因:`, finishReason);
    console.log(`⏱️ 耗时: ${duration}ms`);
    console.log(`🔗 使用 Response API: ${usesResponseAPI ? '是' : '否'}`);
    console.log('---');
    
    return {
      model,
      success: true,
      duration,
      response: text,
      usedResponseAPI: usesResponseAPI,
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ 模型 ${model} 测试失败`);
    console.log(`🚨 错误信息: ${(error as Error).message}`);
    console.log(`⏱️ 耗时: ${duration}ms`);
    console.log('---');
    
    return {
      model,
      success: false,
      duration,
      error: (error as Error).message,
    };
  }
}

// 主测试函数
async function runModelTests(): Promise<void> {
  console.log(`🧪 开始测试 ${modelsToTest.length} 个模型\n`);
  
  const results: TestResult[] = [];
  
  for (const model of modelsToTest) {
    const result = await testModelGenerateText(model);
    results.push(result);
    
    // 在模型之间添加短暂延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 输出测试结果摘要
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 测试结果摘要');
  console.log(`${'='.repeat(80)}`);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const responseAPIModels = results.filter(r => r.usedResponseAPI);
  
  console.log(`\n📈 总体统计:`);
  console.log(`✅ 成功: ${successful.length}/${results.length}`);
  console.log(`❌ 失败: ${failed.length}/${results.length}`);
  console.log(`🔗 使用 Response API 的模型: ${responseAPIModels.length}`);
  
  console.log(`\n✅ 成功的模型:`);
  successful.forEach(result => {
    const status = result.usedResponseAPI ? '🔗' : '📝';
    console.log(`${status} ${result.model} (${result.duration}ms)`);
    if (result.response) {
      console.log(`   响应: ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}`);
    }
  });
  
  if (failed.length > 0) {
    console.log(`\n❌ 失败的模型:`);
    failed.forEach(result => {
      console.log(`❌ ${result.model} (${result.duration}ms)`);
      console.log(`   错误: ${result.error}`);
    });
  }
  
  console.log(`\n🔗 Response API 模型测试结果:`);
  responseAPIModels.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.model} - ${result.success ? 'Response API 工作正常' : 'Response API 调用失败'}`);
  });
  
  // 检查是否有模型使用了 Response API
  const responseAPISuccess = responseAPIModels.filter(r => r.success);
  if (responseAPISuccess.length > 0) {
    console.log(`\n🎉 Response API 测试成功! 以下模型正确使用了 Response API:`);
    responseAPISuccess.forEach(result => {
      console.log(`   ✅ ${result.model}`);
    });
  }
  
  console.log(`\n🎯 测试完成!`);
}

// 执行测试
runModelTests()
  .then(() => {
    console.log('\n🏁 所有测试执行完毕');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 测试执行过程中发生错误:', error);
    process.exit(1);
  });
