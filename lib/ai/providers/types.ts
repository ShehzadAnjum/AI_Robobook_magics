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
   * Send a chat message and get a complete response
   * @param messages - Array of conversation messages
   * @param systemPrompt - Optional system prompt for context
   * @returns Promise that resolves to the complete response text
   */
  chat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<string>;

  /**
   * Get provider name
   */
  getName(): string;
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
}
