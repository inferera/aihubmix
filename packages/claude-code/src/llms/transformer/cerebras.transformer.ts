import { LLMProvider, UnifiedChatRequest, UnifiedMessage } from "../types/llm";
import { Transformer } from "../types/transformer";

/**
 * Converts content from Claude Code format (array of objects) to plain string
 * @param content - The content to convert
 * @returns The converted string content
 */
function convertContentToString(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === 'string') {
          return item;
        }
        if (typeof item === 'object' && item !== null && 
            'type' in item && item.type === 'text' && 
            'text' in item && typeof item.text === 'string') {
          return item.text;
        }
        return '';
      })
      .join('');
  }
  
  return '';
}

/**
 * Transformer class for Cerebras
 */
export class CerebrasTransformer implements Transformer {
  name = "cerebras";

  /**
   * Transform the request from Claude Code format to Cerebras format
   * @param request - The incoming request
   * @param provider - The LLM provider information
   * @returns The transformed request
   */
  async transformRequestIn(
    request: UnifiedChatRequest,
    provider: LLMProvider
  ): Promise<Record<string, unknown>> {
    // Deep clone the request to avoid modifying the original
    const transformedRequest = JSON.parse(JSON.stringify(request));
    
    // IMPORTANT: Cerebras API requires a model field in the request body
    // If model is not present in the request, use the first model from provider config
    if (!transformedRequest.model && provider.models && provider.models.length > 0) {
      transformedRequest.model = provider.models[0];
    }
    
    // Handle system field at the top level - convert to system message
    if (transformedRequest.system !== undefined) {
      const systemContent = convertContentToString(transformedRequest.system);
      // Add system message at the beginning of messages array
      if (!transformedRequest.messages) {
        transformedRequest.messages = [];
      }
      transformedRequest.messages.unshift({
        role: 'system',
        content: systemContent
      });
      // Remove the top-level system field as it's now in messages
      delete transformedRequest.system;
    }
    
    // Transform messages - IMPORTANT: This must convert ALL message content to strings
    if (transformedRequest.messages && Array.isArray(transformedRequest.messages)) {
      transformedRequest.messages = transformedRequest.messages.map((message: UnifiedMessage) => {
        const transformedMessage = { ...message };
        
        // Convert content to string format for ALL messages
        if (transformedMessage.content !== undefined) {
          transformedMessage.content = convertContentToString(transformedMessage.content);
        }
        
        return transformedMessage;
      });
    }
    
    return {
      body: transformedRequest,
      config: {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    };
  }

  /**
   * Transform the response
   * @param response - The response from Cerebras
   * @returns The transformed response
   */
  async transformResponseOut(response: Response): Promise<Response> {
    // Cerebras responses should be compatible with Claude Code
    // No transformation needed
    return response;
  }
}