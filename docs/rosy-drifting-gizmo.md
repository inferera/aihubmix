# 动态端点选择与模型配置缓存实施计划

## 需求概述

实现基于 API 的动态端点选择，从 `https://aihubmix.com/api/v1/models` 获取模型配置，根据 `endpoints` 字段选择调用方式，同时通过缓存优化性能。

## 核心决策

- **端点优先级**：当有多个 endpoints 时，使用列表中的第一个
- **缓存策略**：内存缓存，5 分钟 TTL
- **回退机制**：API 失败或无配置时，使用现有的前缀匹配逻辑

## 实施步骤

### 1. 添加类型定义

**位置**：`packages/ai-sdk-provider/src/aihubmix-provider.ts` (文件开头)

添加以下类型：

```typescript
// 端点类型枚举
type EndpointType = 'chat_completions' | 'responses' | 'gemini_api' | 'claude_api';

// 模型配置
interface ModelConfig {
  model_id: string;
  endpoints: EndpointType[];
  developer_id?: number;
  desc?: string;
  pricing?: any;
  types?: string;
  features?: string;
  input_modalities?: string;
  max_output?: number;
  context_length?: number;
}

// 缓存结构
interface ModelConfigCache {
  data: Map<string, ModelConfig>;
  lastFetched: number | null;
  fetchPromise: Promise<void> | null;
  ttl: number;
}
```

### 2. 扩展 Provider Settings

**位置**：`AihubmixProviderSettings` 接口 (line 331-335)

```typescript
export interface AihubmixProviderSettings {
  apiKey?: string;
  fetch?: FetchFunction;
  compatibility?: 'strict' | 'compatible';

  // 新增配置
  modelConfigCacheTTL?: number; // 缓存有效期，默认 5 分钟
  disableModelConfigCache?: boolean; // 禁用缓存（用于测试）
}
```

### 3. 实现缓存系统

**位置**：在 `AihubmixProviderSettings` 接口之后

```typescript
// 单例缓存实例
let modelConfigCache: ModelConfigCache | null = null;

// 初始化缓存
function initializeCache(ttl: number = 5 * 60 * 1000): ModelConfigCache {
  return {
    data: new Map(),
    lastFetched: null,
    fetchPromise: null,
    ttl,
  };
}

// 解析 endpoints 字符串
function parseEndpoints(endpointString?: string): EndpointType[] {
  if (!endpointString) return [];

  const validEndpoints = ['chat_completions', 'responses', 'gemini_api', 'claude_api'];
  return endpointString
    .split(',')
    .map(e => e.trim() as EndpointType)
    .filter(e => validEndpoints.includes(e));
}

// 获取模型配置 API
async function fetchModelConfigurations(
  apiKey: string,
  customFetch?: FetchFunction
): Promise<ModelConfig[]> {
  const fetchFn = customFetch || fetch;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetchFn('https://aihubmix.com/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'APP-Code': 'WHVL9885',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const json = await response.json();
    const data = json.data || [];

    return data.map((item: any) => ({
      model_id: item.model_id,
      endpoints: parseEndpoints(item.endpoints),
      developer_id: item.developer_id,
      desc: item.desc,
      pricing: item.pricing,
      types: item.types,
      features: item.features,
      input_modalities: item.input_modalities,
      max_output: item.max_output,
      context_length: item.context_length,
    })).filter((config: ModelConfig) => config.model_id);

  } catch (error) {
    console.warn('[aihubmix] Failed to fetch model configurations:', error);
    return [];
  }
}

// 刷新缓存
async function refreshCache(
  apiKey: string,
  customFetch?: FetchFunction
): Promise<void> {
  if (!modelConfigCache) return;

  // 防止并发请求
  if (modelConfigCache.fetchPromise) {
    return modelConfigCache.fetchPromise;
  }

  const doFetch = async () => {
    const configs = await fetchModelConfigurations(apiKey, customFetch);

    if (modelConfigCache) {
      modelConfigCache.data.clear();
      configs.forEach(config => {
        modelConfigCache!.data.set(config.model_id, config);
      });
      modelConfigCache.lastFetched = Date.now();
    }
  };

  modelConfigCache.fetchPromise = doFetch();
  await modelConfigCache.fetchPromise;
  modelConfigCache.fetchPromise = null;
}

// 获取单个模型配置
function getModelConfig(modelId: string): ModelConfig | null {
  if (!modelConfigCache) return null;

  // 检查是否需要刷新（TTL 过期）
  const needsRefresh =
    modelConfigCache.lastFetched === null ||
    Date.now() - modelConfigCache.lastFetched > modelConfigCache.ttl;

  // 如果过期但有缓存，返回缓存数据（不阻塞）
  // 后台刷新将在下次调用时触发

  return modelConfigCache.data.get(modelId) || null;
}

// 选择端点（使用第一个可用端点）
function selectEndpoint(config: ModelConfig): EndpointType | null {
  return config.endpoints.length > 0 ? config.endpoints[0] : null;
}
```

### 4. 修改 createChatModel

**位置**：`createChatModel` 函数 (line 452-507)

**修改策略**：在现有前缀匹配之前，先尝试从缓存获取配置

```typescript
const createChatModel = (
  deploymentName: string,
  settings: OpenAIProviderSettings = {},
) => {
  const headers = getHeaders();

  // 尝试从缓存获取模型配置
  const modelConfig = getModelConfig(deploymentName);
  const endpoint = modelConfig ? selectEndpoint(modelConfig) : null;

  // 根据 endpoint 或前缀匹配选择实现
  // 优先使用 endpoint，其次使用前缀匹配

  // Claude API
  if (endpoint === 'claude_api' || (!endpoint && deploymentName.startsWith('claude-'))) {
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

  // Gemini API
  if (endpoint === 'gemini_api' ||
      (!endpoint &&
       (deploymentName.startsWith('gemini') || deploymentName.startsWith('imagen')) &&
       !deploymentName.endsWith('-nothink') &&
       !deploymentName.endsWith('-search'))) {
    return new GoogleGenerativeAILanguageModel(deploymentName, {
      provider: 'aihubmix.chat',
      baseURL: 'https://aihubmix.com/gemini/v1beta',
      headers: {
        ...headers,
        'x-goog-api-key': headers['Authorization'].split(' ')[1],
      },
      generateId: () => `aihubmix-${Date.now()}`,
      supportedUrls: () => ({}),
    });
  }

  // Responses API (目前注释掉，但保留支持)
  // if (endpoint === 'responses') {
  //   return new OpenAIResponsesLanguageModel(deploymentName, {
  //     provider: 'aihubmix.chat',
  //     url,
  //     headers: getHeaders,
  //     fetch: options.fetch,
  //     fileIdPrefixes: ['file-'],
  //   });
  // }

  // Chat Completions (OpenAI 兼容) - 默认
  return new AihubmixOpenAIChatLanguageModel(deploymentName, {
    provider: 'aihubmix.chat',
    url,
    headers: getHeaders,
    fetch: options.fetch,
  });
};
```

### 5. 集成到 createAihubmix

**位置**：`createAihubmix` 函数开头

在函数开始时初始化缓存并触发后台预热：

```typescript
export function createAihubmix(
  options: AihubmixProviderSettings = {},
): AihubmixProvider {
  const config = getApiKey({ apiKey: options.apiKey });
  const getHeaders = () => headers({ apiKey: () => config.apiKey });

  // 初始化缓存（如果未禁用）
  if (!modelConfigCache && !options.disableModelConfigCache) {
    modelConfigCache = initializeCache(options.modelConfigCacheTTL);

    // 后台预热缓存（不阻塞）
    if (config.apiKey) {
      refreshCache(config.apiKey, options.fetch).catch(err => {
        console.warn('[aihubmix] Cache warm-up failed:', err);
      });
    }
  }

  // ... 现有代码 ...
```

### 6. 添加公共方法

**位置**：provider 对象定义 (返回值)

```typescript
const provider = Object.assign(providerFn, {
  // ... 现有方法 ...

  // 手动刷新缓存
  refreshModelConfig: async () => {
    if (!config.apiKey) {
      throw new Error('API key required to refresh model configuration');
    }
    await refreshCache(config.apiKey, options.fetch);
  },

  // 清除缓存
  clearModelConfigCache: () => {
    if (modelConfigCache) {
      modelConfigCache.data.clear();
      modelConfigCache.lastFetched = null;
    }
  },

  // 获取缓存状态（用于调试）
  getModelConfigCacheStatus: () => {
    if (!modelConfigCache) return null;
    return {
      size: modelConfigCache.data.size,
      lastFetched: modelConfigCache.lastFetched,
      age: modelConfigCache.lastFetched
        ? Date.now() - modelConfigCache.lastFetched
        : null,
    };
  },
});
```

### 7. 更新类型导出

**位置**：`packages/ai-sdk-provider/src/index.ts`

确保导出新的类型：

```typescript
export type { EndpointType, ModelConfig };
```

## 关键文件清单

| 文件 | 修改内容 | 估计行数 |
|------|---------|---------|
| `packages/ai-sdk-provider/src/aihubmix-provider.ts` | 添加类型、缓存系统、修改 createChatModel | +200 行 |
| `packages/ai-sdk-provider/src/index.ts` | 导出新类型 | +1 行 |
| `packages/ai-sdk-provider/src/aihubmix-provider.test.ts` | 添加缓存和端点选择测试 | +150 行 |

## 边缘情况处理

1. **API 不可用**：使用前缀匹配逻辑作为回退
2. **空 endpoints 字段**：视为无配置，使用回退逻辑
3. **无效 endpoint 值**：过滤掉无效值，使用剩余有效值
4. **缓存过期**：返回旧数据，后台触发刷新（非阻塞）
5. **并发请求**：使用 fetchPromise 锁防止重复请求
6. **模型不在缓存**：使用回退逻辑，不触发额外请求

## 性能影响

- **缓存命中**：< 1ms (Map lookup)
- **缓存未命中（首次）**：+5s 最大（API 超时）
- **正常运行**：后台刷新，不阻塞用户请求
- **内存占用**：约 20-50KB (100-200 个模型配置)

## 验证计划

### 单元测试

1. `parseEndpoints()` - 解析逗号分隔的端点
2. `selectEndpoint()` - 选择第一个端点
3. `fetchModelConfigurations()` - API 调用成功/失败
4. `refreshCache()` - 并发保护
5. `getModelConfig()` - 缓存查找

### 集成测试

1. Mock `/api/v1/models` 端点
2. 测试不同 endpoints 组合的路由
3. 测试缓存 TTL 过期
4. 测试 API 失败时的回退

### 端到端测试

```typescript
// 测试缓存工作流程
const aihubmix = createAihubmix({ apiKey: 'test' });

// 等待缓存预热
await new Promise(resolve => setTimeout(resolve, 100));

// 验证配置被缓存
const status = aihubmix.getModelConfigCacheStatus();
console.log('Cache status:', status);

// 测试模型创建
const model = aihubmix('gemini-2.5-flash-image-preview');
// 应该根据 endpoints 选择正确的实现
```

## 回滚计划

如果出现问题，可以通过以下方式禁用功能：

```typescript
const aihubmix = createAihubmix({
  apiKey: 'key',
  disableModelConfigCache: true, // 禁用缓存
});
```

这将完全回退到现有的前缀匹配逻辑。

## 后续优化（可选）

1. **持久化缓存**：将缓存写入文件系统，加快启动速度
2. **增量更新**：仅更新变化的模型配置
3. **WebSocket 推送**：实时接收配置更新
4. **区域化路由**：根据地理位置选择最优端点
