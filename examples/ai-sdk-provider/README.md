# Aihubmix AI SDK Provider Examples

这个目录包含了 Aihubmix AI SDK Provider 的使用示例。

## 安装依赖

```bash
pnpm install
```

## 配置 API 密钥

在运行示例之前，你需要配置 Aihubmix API 密钥。有两种方式：

### 方式 1: 环境变量

创建 `.env` 文件并添加你的 API 密钥：

```bash
echo "AIHUBMIX_API_KEY=your_api_key_here" > .env
```

### 方式 2: 代码中传入

在代码中直接传入 API 密钥：

```typescript
const { text } = await generateText({
  model: aihubmix('gpt-4o-mini', { apiKey: 'your_api_key_here' }),
  prompt: 'Hello, world!',
});
```

## 运行示例

```bash
# 运行所有测试
pnpm test

# 运行开发模式
pnpm dev

# 构建项目
pnpm build

# 运行构建后的代码
pnpm start
```

## 示例功能

- **文本生成**: 使用 `generateText` 生成文本
- **流式文本**: 使用 `streamText` 流式生成文本
- **图像生成**: 使用 `generateImage` 生成图像
- **文本嵌入**: 使用 `embed` 生成文本嵌入
- **语音合成**: 使用 `generateSpeech` 生成语音
- **语音转录**: 使用 `transcribe` 转录音频（需要音频文件）

## 注意事项

- 确保你的 Node.js 版本 >= 18
- 某些功能（如语音转录）需要额外的文件或配置
- 所有 API 调用都需要有效的 Aihubmix API 密钥 
