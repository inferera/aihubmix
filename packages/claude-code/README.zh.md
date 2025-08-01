# Claude Code Router

<div align="center">
  <div style="margin-bottom: 20px;">
    <a href="./README.zh.md" style="margin: 0 10px; padding: 8px 16px; background-color: #007acc; color: white; text-decoration: none; border-radius: 4px;">中文</a>
    <a href="./README.md" style="margin: 0 10px; padding: 8px 16px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 4px;">English</a>
    <a href="./README.ja.md" style="margin: 0 10px; padding: 8px 16px; background-color: #f0f0f0; color: #333; text-decoration: none; border-radius: 4px;">日本語</a>
  </div>
</div>

一个简化的 Claude Code 路由服务，支持多种 AI 模型。

## 功能特性

- 🚀 简化的配置管理
- 🔄 自动路由到不同的 AI 模型
- ⚡ 快速启动和停止
- 🔧 易于配置

## 安装

首先，请确保您已安装 Claude Code：
```bash
npm install -g @anthropic-ai/claude-code

```
然后，安装 @aihubmix/claude-code：
```bash
npm install -g @aihubmix/claude-code
```

## 配置

现在支持两种配置方式，详细说明请查看 [CONFIGURATION.md](./CONFIGURATION.md)。

### 1. 环境变量配置（推荐）

```bash
export AIHUBMIX_API_KEY="your-api-key-here"
export HOST="127.0.0.1"  # 可选
export PORT="3456"        # 可选
export LOG="true"         # 可选
export API_TIMEOUT_MS="30000"  # 可选
```

### 2. 配置文件

配置文件位于 `~/.aihubmix-claude-code/config.json`：

```json
{
  "API_KEY": "your-api-key-here",
  "HOST": "127.0.0.1",
  "PORT": 3456,
  "LOG": true,
  "API_TIMEOUT_MS": 30000,
  "Router": {
    "default": "claude-sonnet-4-20250514",
    "background": "claude-3-5-haiku-20241022",
    "think": "claude-sonnet-4-20250514",
    "longContext": "gpt-4.1",
    "longContextThreshold": 60000,
    "webSearch": "gemini-2.0-flash-search"
  }
}
```

**注意**: 环境变量的优先级高于配置文件。



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

## 路由规则

### 默认模型配置

```json
{
  "default": "claude-sonnet-4-20250514",
  "background": "claude-3-5-haiku-20241022", 
  "think": "claude-sonnet-4-20250514",
  "longContext": "gpt-4.1",
  "longContextThreshold": 60000,
  "webSearch": "gemini-2.0-flash-search"
}
```

### 路由逻辑

- **默认**: 使用 `claude-sonnet-4-20250514` 模型
- **背景任务**: 当模型为 `claude-3-5-haiku` 时，使用 `claude-sonnet-4-20250514` 模型
- **思考任务**: 当请求包含 `thinking` 参数时，使用 `claude-sonnet-4-20250514` 模型
- **长上下文**: 当 token 数超过 60000 时，使用 `gpt-4.1` 模型
- **网络搜索**: 当请求包含 `web_search` 工具时，使用 `gemini-2.0-flash-search` 模型

### 自定义路由配置

你可以在配置文件中自定义 `Router` 部分来覆盖默认的模型配置：

```json
{
  "Router": {
    "default": "your-custom-model",
    "background": "your-background-model", 
    "think": "your-thinking-model",
    "longContext": "your-long-context-model",
    "longContextThreshold": 50000,
    "webSearch": "your-web-search-model"
  }
}
```

#### Router 配置项说明

- **default**: 默认使用的模型
- **background**: 背景任务使用的模型
- **think**: 思考任务使用的模型  
- **longContext**: 长上下文任务使用的模型
- **longContextThreshold**: 触发长上下文模型的 token 阈值（默认 60000）
- **webSearch**: 网络搜索任务使用的模型

