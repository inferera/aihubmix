import { FastifyRequest, FastifyReply } from "fastify";
import { log } from "../utils/log";

export const apiKeyAuth =
  (config: any) =>
  (req: FastifyRequest, reply: FastifyReply, done?: () => void) => {
    // 跳过API key验证，因为这个服务是一个透明的代理
    // 服务器会使用配置的API key来调用AIHubMix的API
    if (["/", "/health"].includes(req.url) || req.url.startsWith("/ui")) {
      return done?.();
    }
    
    // 对于其他请求，直接通过，不需要验证客户端API key
    done?.();
  };
