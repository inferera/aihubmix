#!/usr/bin/env tsx

async function main() {
  console.log('🚀 测试 acc 命令是否存在...')
  
  try {
    // 测试 acc 命令是否可用
    console.log('📋 检查 acc 命令...')
    
    const { execSync } = await import('child_process')
    
    try {
      // 尝试执行 acc --version 或 acc -v
      const version = execSync('acc --version', { encoding: 'utf8' })
      console.log('✅ acc 命令存在，版本信息:', version.trim())
    } catch (error) {
      try {
        const version = execSync('acc -v', { encoding: 'utf8' })
        console.log('✅ acc 命令存在，版本信息:', version.trim())
      } catch (error2) {
        console.log('❌ acc 命令不存在或无法执行')
        console.log('💡 请确保已安装 @aihubmix/claude-code 包')
        console.log('   安装命令: npm install -g @aihubmix/claude-code')
        process.exit(1)
      }
    }
    
    // 测试 acc 命令的帮助信息
    try {
      const help = execSync('acc --help', { encoding: 'utf8' })
      console.log('✅ acc 命令帮助信息可用')
      console.log('📖 帮助信息预览:')
      console.log(help.split('\n').slice(0, 10).join('\n'))
    } catch (error) {
      console.log('⚠️  无法获取 acc 命令帮助信息')
    }
    
    console.log('\n🎉 acc 命令测试完成!')
    console.log('\n💡 可用的 acc 命令:')
    console.log('   acc start     - 启动服务器')
    console.log('   acc stop      - 停止服务器')
    console.log('   acc restart   - 重启服务器')
    console.log('   acc status    - 显示服务器状态')
    console.log('   acc code      - 执行 claude 命令')
    console.log('   acc ui        - 打开 Web UI')
    console.log('   acc -v        - 显示版本')
    console.log('   acc -h        - 显示帮助')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

main().catch(console.error) 
