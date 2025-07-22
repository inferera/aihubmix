#!/usr/bin/env node

/**
 * 演示如何以编程方式创建 changeset
 * 这个脚本展示了 changeset 的基本用法
 */

const fs = require('fs');
const path = require('path');

// 创建 changeset 目录（如果不存在）
const changesetDir = path.join(__dirname, '..', '.changeset');
if (!fs.existsSync(changesetDir)) {
  fs.mkdirSync(changesetDir, { recursive: true });
}

// 生成唯一的 changeset 文件名
const timestamp = Date.now();
const changesetFile = path.join(changesetDir, `demo-${timestamp}.md`);

// 创建示例 changeset 内容
const changesetContent = `---
"@aihubmix/ai-sdk-provider": patch
---

这是一个示例变更集，用于演示 changeset 的使用。

## 变更内容

- 添加了新的功能
- 修复了已知问题
- 改进了性能

## 使用说明

1. 运行 \`pnpm changeset\` 创建变更集
2. 运行 \`pnpm version\` 更新版本
3. 运行 \`pnpm release\` 发布到 npm
`;

// 写入文件
fs.writeFileSync(changesetFile, changesetContent);

console.log(`✅ 创建了示例 changeset: ${changesetFile}`);
console.log('📝 你可以编辑这个文件来修改变更描述');
console.log('🚀 运行 "pnpm version" 来应用这个变更集'); 
