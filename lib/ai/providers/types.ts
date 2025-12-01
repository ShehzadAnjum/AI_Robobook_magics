/**
 * AI Provider Abstraction
 * Allows swapping between different AI models (Gemini, OpenAI, etc.)
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

export interface LLMProvider {
  /**
   * Send a chat message and get a streaming response
   * @param messages - Array of conversation messages
   * @param systemPrompt - Optional system prompt for context
   * @returns AsyncIterable that yields text chunks
   */
  streamChat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): AsyncIterable<StreamChunk>;

  /**
   * Get provider name
   */
  getName(): string;
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
}
