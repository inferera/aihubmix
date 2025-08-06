# @aihubmix/mcp

## 使用教程
客户端 mcp配置，更改后重启客户端生效
```json
{
  "mcpServers": {
    "aihubmix-mcp": {
      "command": "npx",
      "args": ["-y", "@aihubmix/mcp"],
      "env": {
        "AIHUBMIX_API_KEY": "<AIHUBMIX_API_KEY>"
      }
    }
  }
}
```

或以如下方式安装：
全局安装 `@aihubmix/mcp` 包
```bash
npm install -g @aihubmix/mcp
```

客户端 mcp 配置
```json
{
  "mcpServers": {
    "aihubmix-mcp": {
      "command": "path/to/node",
      "args": ["path/to/@aihubmix/mcp/build/server.js"],
      "env": {
         "BRAVE_KEY": "..."
      }
    }
  }
}
```
例如：
```json
{
  "mcpServers": {
    "aihubmix-mcp": {
      "command": "/Users/zhaochenxue/.nvm/versions/node/v16.20.0/bin/node",
      "args": ["/Users/zhaochenxue/.nvm/versions/node/v16.20.0/lib/node_modules/@aihubmix/mcp/build/server.js"],
      "env": {
        "AIHUBMIX_API_KEY": "<AIHUBMIX_API_KEY>"
      }
    }
  }
}
```

## 使用案例

1、Cursor 中使用：

```json
{
  "mcpServers": {
    "aihubmix-mcp": {
      "command": "npx",
      "args": ["-y", "@aihubmix/mcp"],
      "env": {
        "AIHUBMIX_API_KEY": "<AIHUBMIX_API_KEY>"
      }
    }
  }
}
```

![cursor](https://www.resource.nestsound.cn/mcp/cursor.jpg)

2、Cherry Studio 中使用：

注意📢：npx 需使用全路径，例如： /Users/zhaochenxue/.nvm/versions/node/v16.20.0/bin/npx
其他问题： https://github.com/CherryHQ/cherry-studio/issues/3264

```json
{
  "mcpServers": {
    "aihubmix-mcp": {
      "command": "/Users/zhaochenxue/.nvm/versions/node/v16.20.0/bin/npx",
      "args": ["-y", "@aihubmix/mcp"],
      "env": {
        "AIHUBMIX_API_KEY": "<AIHUBMIX_API_KEY>"
      }
    }
  }
}
```

![cherry studio](https://www.resource.nestsound.cn/mcp/cherry.jpg)


3、Claude Desktop 中使用：

```bash
npm install -g @aihubmix/mcp
```

```json
{
  "mcpServers": {
    "aihubmix-mcp-server": {
      "command": "/Users/zhaochenxue/.nvm/versions/node/v16.20.0/bin/node",
      "args": ["/Users/zhaochenxue/.nvm/versions/node/v16.20.0/lib/node_modules/aihubmix-mcp-server/build/server.js"],
      "env": {
        "AIHUBMIX_API_KEY": "<AIHUBMIX_API_KEY>"
      }
    }
  }
}
```

![claude](https://www.resource.nestsound.cn/mcp/claude.jpg)

