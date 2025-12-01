import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, LLMProvider, ProviderConfig, StreamChunk } from './types';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    // Default to gemini-pro which is stable and widely available
    // Use gemini-2.0-flash or gemini-2.0-flash-exp via GEMINI_MODEL env var if needed
    this.model = config.model || 'gemini-pro';
  }

  getName(): string {
    return `Gemini (${this.model})`;
  }

  async *streamChat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): AsyncIterable<StreamChunk> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history,
    });

    try {
      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield {
            content: text,
            done: false,
          };
        }
      }

      yield {
        content: '',
        done: true,
      };
    } catch (error) {
      console.error('Gemini streaming error:', error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error(
          `Gemini API rate limit exceeded. Please wait before retrying. Original error: ${error.message}`
        );
      }
      
      // Check if it's a model not found error
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        throw new Error(
          `Gemini model '${this.model}' not found. Try using 'gemini-pro' or 'gemini-2.0-flash'. Original error: ${error.message}`
        );
      }
      
      throw new Error(
        `Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async chat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history,
    });

    try {
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No content in Gemini response');
      }

      return text;
    } catch (error) {
      console.error('Gemini chat error:', error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        throw new Error(
          `Gemini API rate limit exceeded. Please wait before retrying. Original error: ${error.message}`
        );
      }
      
      // Check if it's a model not found error
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        throw new Error(
          `Gemini model '${this.model}' not found. Try using 'gemini-pro' or 'gemini-2.0-flash'. Original error: ${error.message}`
        );
      }
      
      throw new Error(
        `Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
