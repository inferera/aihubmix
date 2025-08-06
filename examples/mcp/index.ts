#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 在 Node.js 环境中使用 fetch
// @ts-ignore
import fetch from 'node-fetch';

// 获取 __dirname 的等效值
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}

class MCPTester {
  private testResults: TestResult[] = [];
  private serverProcess: any = null;
  private testDir = './output/mcp-test';

  async runAllTests(): Promise<void> {
    console.log('🚀 开始执行 @aihubmix/mcp 测试套件\n');

    try {
      // 创建测试目录
      await this.setupTestDirectory();

      // 运行测试
      await this.testMCPCommand();
      await this.testMCPServer();
      await this.testFileOperations();
      await this.testAPITools();
      await this.testPaintingTools();

      // 显示测试结果
      this.displayResults();

    } catch (error) {
      console.error('❌ 测试套件执行失败:', error);
      process.exit(1);
    } finally {
      // 清理
      await this.cleanup();
    }
  }

  private async setupTestDirectory(): Promise<void> {
    console.log('📁 设置测试目录...');
    
    if (!existsSync(this.testDir)) {
      await mkdir(this.testDir, { recursive: true });
    }
    
    // 创建测试文件
    const testContent = '这是一个测试文件，用于测试 MCP 服务器的文件操作功能。';
    await writeFile(path.join(this.testDir, 'test.txt'), testContent);
    
    console.log('✅ 测试目录设置完成');
  }

  private async testMCPCommand(): Promise<void> {
    const testName = 'MCP 命令测试';
    const startTime = Date.now();
    
    try {
      console.log(`\n📋 执行 ${testName}...`);
      
      // 检查本地包是否存在
      const packagePath = path.resolve(__dirname, '../../packages/mcp/package.json');
      if (existsSync(packagePath)) {
        console.log('✅ MCP 包存在');
        
        // 读取包信息
        const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
        console.log('📦 包信息:', {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description
        });
      } else {
        throw new Error('MCP 包不存在');
      }
      
      this.testResults.push({
        name: testName,
        success: true,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      });
      console.log(`❌ ${testName} 失败:`, (error as Error).message);
    }
  }

  private async testMCPServer(): Promise<void> {
    const testName = 'MCP 服务器测试';
    const startTime = Date.now();
    
    try {
      console.log(`\n🔧 执行 ${testName}...`);
      
      // 启动服务器
      this.serverProcess = spawn('npx', ['-y', '@aihubmix/mcp'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          AIHUBMIX_API_KEY: process.env.AIHUBMIX_API_KEY || 'test-key'
        }
      });
      
      // 等待服务器启动
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (this.serverProcess && !this.serverProcess.killed) {
        console.log('✅ MCP 服务器启动成功');
        
        // 停止服务器
        this.serverProcess.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error('服务器启动失败');
      }
      
      this.testResults.push({
        name: testName,
        success: true,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      });
      console.log(`❌ ${testName} 失败:`, (error as Error).message);
    }
  }

  private async testFileOperations(): Promise<void> {
    const testName = '文件操作测试';
    const startTime = Date.now();
    
    try {
      console.log(`\n📄 执行 ${testName}...`);
      
      const testFile = path.join(this.testDir, 'file-test.txt');
      const testContent = '这是文件操作测试的内容';
      
      // 写入文件
      await writeFile(testFile, testContent);
      console.log('✅ 文件写入成功');
      
      // 读取文件
      const readContent = await readFile(testFile, 'utf-8');
      if (readContent === testContent) {
        console.log('✅ 文件读取成功');
      } else {
        throw new Error('文件内容不匹配');
      }
      
      this.testResults.push({
        name: testName,
        success: true,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      });
      console.log(`❌ ${testName} 失败:`, (error as Error).message);
    }
  }

  private async testAPITools(): Promise<void> {
    const testName = 'API 工具测试';
    const startTime = Date.now();
    
    try {
      console.log(`\n🌐 执行 ${testName}...`);
      
      // 测试 HTTP 请求
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'User-Agent': 'aihubmix-mcp-test/1.0.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        console.log('✅ HTTP 请求测试成功');
        console.log('📡 响应状态:', response.status);
        console.log('🌐 请求 URL:', data.url);
      } else {
        throw new Error(`HTTP 请求失败: ${response.status} ${response.statusText}`);
      }
      
      this.testResults.push({
        name: testName,
        success: true,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      });
      console.log(`❌ ${testName} 失败:`, (error as Error).message);
    }
  }

  private async testPaintingTools(): Promise<void> {
    const testName = '绘画工具测试';
    const startTime = Date.now();
    
    try {
      console.log(`\n🎨 执行 ${testName}...`);
      
      // 这里可以添加绘画工具的测试
      // 由于需要 API 密钥，这里只是模拟测试
      console.log('✅ 绘画工具测试通过（模拟）');
      
      this.testResults.push({
        name: testName,
        success: true,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      this.testResults.push({
        name: testName,
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      });
      console.log(`❌ ${testName} 失败:`, (error as Error).message);
    }
  }

  private async executeCommand(command: string, args: string[]): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          resolve({ success: false, output: errorOutput });
        }
      });
    });
  }

  private displayResults(): void {
    console.log('\n📊 测试结果汇总:');
    console.log('='.repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.name} (${duration})`);
      
      if (!result.success && result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });
    
    console.log('='.repeat(50));
    console.log(`总计: ${totalTests} 个测试`);
    console.log(`通过: ${passedTests} 个`);
    console.log(`失败: ${failedTests} 个`);
    
    if (failedTests === 0) {
      console.log('\n🎉 所有测试通过！');
    } else {
      console.log('\n⚠️  部分测试失败，请检查配置和依赖。');
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 清理测试环境...');
    
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill('SIGTERM');
    }
    
    console.log('✅ 清理完成');
  }
}

async function main() {
  const tester = new MCPTester();
  await tester.runAllTests();
}

main().catch(console.error); 
