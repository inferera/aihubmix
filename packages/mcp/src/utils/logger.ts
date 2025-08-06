import winston from 'winston';

// 创建一个格式化器，将日志转换为纯文本格式
const plainTextFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

// 创建 logger 实例
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    plainTextFormat
  ),
  transports: [
    // 将日志输出到 stderr
    new winston.transports.Stream({
      stream: process.stderr,
      format: winston.format.combine(
        winston.format.timestamp(),
        plainTextFormat
      )
    })
  ]
});

// 重写 console.log 和 console.error 以确保所有输出都是 JSON 格式
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  logger.info(args.join(' '));
};

console.error = (...args) => {
  logger.error(args.join(' '));
}; 
