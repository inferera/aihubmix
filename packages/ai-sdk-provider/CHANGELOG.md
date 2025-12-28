# @aihubmix/ai-sdk-provider

## 1.0.1

### Patch Changes

- 📝 Updated documentation for AI SDK v6 compatibility
- Updated documentation links from v5.ai-sdk.dev to sdk.vercel.ai
- Added version badges and experimental API usage notes
- Updated all README files (EN, ZH, JA)

## 1.0.0

### Major Changes

- 🎉 **AI SDK v6 Compatibility** - Full support for AI SDK v6
- Upgraded to Language Model Specification V3
- Updated all provider dependencies to v3/v4 compatible versions:
  - `@ai-sdk/anthropic`: ^3.0.0
  - `@ai-sdk/google`: ^3.0.0
  - `@ai-sdk/openai`: ^3.0.0
  - `@ai-sdk/provider`: ^3.0.0
  - `@ai-sdk/provider-utils`: ^4.0.0
- Updated tool factory APIs to new specification (removed `name` property)
- Breaking: Requires AI SDK v6 (ai ^6.0.0)

## 0.0.2

### Patch Changes

- change llm V1 to V2
- 8e1ca80: Aihubmix Provider for Vercel AI SDK

## 0.0.1

### Patch Changes

- Initial release of Aihubmix provider
- Support for multiple AI providers through Aihubmix API
- Support for OpenAI-compatible models (GPT models)
- Support for Anthropic Claude models
- Support for Google Gemini models
- Support for image generation models
- Support for embedding models
- Support for transcription models
- Support for speech synthesis models
- Support for web search preview tool
- Strict compatibility mode with OpenAI API
