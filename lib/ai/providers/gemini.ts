import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, LLMProvider, ProviderConfig, StreamChunk } from './types';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-2.0-flash-exp';
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
      throw new Error(
        `Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
