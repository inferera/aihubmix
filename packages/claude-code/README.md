# Claude Code Router

一个简化的 Claude Code 路由服务，支持多种 AI 模型。

## 功能特性

- 🚀 简化的配置管理
- 🔄 自动路由到不同的 AI 模型
- ⚡ 快速启动和停止
- 🔧 易于配置

## 安装

```bash
npm install @aihubmix/claude-code
```

## 配置

### 1. 设置环境变量

```bash
export AIHUBMIX_API_KEY="your-api-key-here"
```

### 2. 配置文件

配置文件位于 `~/.aihubmix-claude-code/config.json`，包含以下内容：

```json
{
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "aihubmix",
      "api_base_url": "https://aihubmix.com/v1/chat/completions",
      "api_key": "",
      "models": [
        "Z/glm-4.5",
        "claude-opus-4-20250514",
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-pro-preview",
        "deepseek-reasoner",
        "deepseek-chat",
        "DeepSeek-R1",
        "DeepSeek-V3",
        "deepseek-chat",
        "gpt-4o-mini",
        "gpt-4.1"
      ]
    }
  ],
  "Router": {
    "default": "aihubmix,gpt-4.1",
    "background": "aihubmix,gpt-4o-mini",
    "think": "aihubmix,deepseek-reasoner",
    "longContext": "aihubmix,gemini-2.5-pro-preview",
    "longContextThreshold": 60000,
    "webSearch": "aihubmix,gemini-2.5-flash"
  }
}
```

**注意**: `api_key` 字段会从环境变量 `AIHUBMIX_API_KEY` 自动获取。

## 使用方法

### 启动服务

```bash
acc start
```

### 停止服务

```bash
acc stop
```

### 重启服务

```bash
acc restart
```

### 查看状态

```bash
acc status
```

### 执行代码命令

```bash
acc code "Write a Hello World function"
```

### 查看版本

```bash
acc version
```

### 查看帮助

```bash
acc help
```

## API 端点

- `POST /v1/messages` - 主要的消息处理端点
- `GET /api/config` - 获取配置
- `POST /api/config` - 保存配置
- `POST /api/restart` - 重启服务

## 路由规则

- **默认**: 使用 `gpt-4.1` 模型
- **背景任务**: 使用 `gpt-4o-mini` 模型
- **思考任务**: 使用 `deepseek-reasoner` 模型
- **长上下文**: 使用 `gemini-2.5-pro-preview` 模型（当 token 数 > 60000）
- **网络搜索**: 使用 `gemini-2.5-flash` 模型

## 开发

```bash
# 构建项目
npm run build

# 发布
npm run release
``` 
