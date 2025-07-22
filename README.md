# Aihubmix
One Gateway, Infinite Models；one-stop request: OpenAI, Claude, Gemini, DeepSeek, Qwen, and over 500 AI models.

## 项目结构

```
.
├── packages/
│   └── ai-sdk-provider/     # 主要的 VERCEL AI SDK Provider 包
├── examples/
│   └── ai-sdk-provider/   # 使用 workspace 依赖的测试示例
├── .changeset/             # Changeset 配置文件
├── pnpm-workspace.yaml     # pnpm workspace 配置
├── turbo.json              # Turbo 构建配置
└── package.json            # 根目录配置
```

## 开发环境设置

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
# 构建所有包
pnpm build

# 监听模式构建
pnpm build:watch
```

### 运行测试

```bash
# 运行所有测试（包括 workspace 测试）
pnpm test:all

# 运行 workspace 依赖测试
pnpm test:workspace

# 运行 examples 测试
pnpm test:examples

# 运行特定包的测试
cd packages/ai-sdk-provider && pnpm test
```

## Workspace 依赖

项目使用 pnpm workspace 来管理包之间的依赖关系。在 `examples/package.json` 中，我们使用 `workspace:*` 来引用同项目中的包：

```json
{
  "dependencies": {
    "@aihubmix/ai-sdk-provider": "workspace:*"
  }
}
```

这允许 examples 包直接使用主包的代码，无需发布到 npm。

### 测试 Workspace 依赖

运行以下命令来测试 workspace 依赖是否正常工作：

```bash
pnpm test:workspace
```

这将执行以下测试：
- ✅ Workspace 依赖测试
- ⚠️ 基本功能测试（需要 API key）

## Changeset 版本管理

项目使用 [changeset](https://github.com/changesets/changesets) 来管理版本和发布。

### 创建变更集

```bash
pnpm changeset
```

这会启动一个交互式界面，让你选择：
1. 哪些包需要更新
2. 版本更新类型（patch/minor/major）
3. 变更描述

### 更新版本

```bash
pnpm version
```

这会根据变更集更新包的版本号并生成 CHANGELOG。

### 发布

```bash
pnpm release
```

这会构建项目并发布到 npm。

## 开发工作流

1. **开发新功能**：在相应的包中进行开发
2. **测试 workspace 依赖**：使用 `pnpm test:workspace` 验证
3. **创建变更集**：使用 `pnpm changeset` 记录变更
4. **更新版本**：使用 `pnpm version` 更新版本
5. **发布**：使用 `pnpm release` 发布到 npm

## 示例

查看 `examples/ai-sdk-provider.ts` 来了解如何使用 workspace 依赖：

```typescript
import { aihubmix } from '@aihubmix/ai-sdk-provider';

console.log('✅ Workspace dependency test successful!');
console.log('AI SDK Provider loaded:', typeof aihubmix);
```

运行示例：

```bash
pnpm test:workspace
```

## 注意事项

- 确保使用 Node.js 18+ 版本
- 使用 pnpm 作为包管理器
- 所有包都通过 workspace 链接，无需手动发布即可在本地使用
- 测试需要 API key 才能完全通过，但 workspace 依赖测试可以在没有 API key 的情况下运行
