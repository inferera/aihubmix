#!/bin/bash

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "错误: 需要 Node.js 16 或更高版本"
    echo "当前版本: $(node -v)"
    echo "请使用 nvm 安装并切换到正确的版本:"
    echo "nvm install 16"
    echo "nvm use 16"
    exit 1
fi

# 清理并重新构建
npm run clean
npm run build

# 启动服务器（使用 ES Module 支持）
NODE_OPTIONS="--experimental-specifier-resolution=node" npm start 
