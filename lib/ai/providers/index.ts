import type { LLMProvider } from './types';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

export * from './types';
export { GeminiProvider } from './gemini';
export { OpenAIProvider } from './openai';

/**
 * Factory function to create an AI provider based on environment configuration
 */
export function createAIProvider(): LLMProvider {
  const provider = process.env.AI_PROVIDER || 'gemini';

  switch (provider.toLowerCase()) {
    case 'gemini':
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }
      return new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
      });

    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in environment variables');
      }
      return new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
      });

    default:
      throw new Error(
        `Unsupported AI provider: ${provider}. Use 'gemini' or 'openai'.`
      );
  }
}
