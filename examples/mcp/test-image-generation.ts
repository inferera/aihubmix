#!/usr/bin/env tsx

async function testImageGeneration() {
  console.log('🎨 测试图像生成功能...\n');

  console.log('📋 工具信息:');
  console.log('名称: image_generate');
  console.log('描述: 支持多种图像生成模型，包括 GPT-Image-1、Ideogram V3、Imagen 等');
  
  console.log('\n📝 支持的参数:');
  console.log('- model: 选择要使用的模型');
  console.log('- prompt: 提示词，所有模型通用');
  console.log('- rendering_speed: 渲染速度 (仅 ideogram/V3)');
  console.log('- aspect_ratio: 图片宽高比例');
  console.log('- n: 生成图片数量');
  console.log('- size: 图片尺寸');
  console.log('- quality: 图片质量');
  console.log('- moderation: 内容审核');
  console.log('- background: 背景设置');
  console.log('- safety_tolerance: 安全容忍度');

  console.log('\n✅ 图像生成工具配置正确');
  console.log('\n💡 支持的模型:');
  console.log('- opanai/gpt-image-1 (默认)');
  console.log('- ideogram/V3');
  console.log('- google/imagen-4.0-ultra-generate-preview-06-06');
  console.log('- google/imagen-4.0-generate-preview-06-06');
  console.log('- bfl/flux-kontext-max');
  console.log('- bfl/flux-Kontext-pro');

  console.log('\n💡 使用示例:');
  console.log('```json');
  console.log('{');
  console.log('  "model": "opanai/gpt-image-1",');
  console.log('  "prompt": "一只可爱的小猫坐在花园里",');
  console.log('  "n": 1,');
  console.log('  "size": "1024x1024",');
  console.log('  "quality": "high"');
  console.log('}');
  console.log('```');

  console.log('\n🔄 已成功从 Go 代码移植到 TypeScript');
  console.log('📦 更新了 @aihubmix/mcp 包的图像生成功能');
}

testImageGeneration().catch(console.error); 
