import OpenAI from 'openai';
import type { ChatMessage, LLMProvider, ProviderConfig, StreamChunk } from './types';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'gpt-4o-mini';
  }

  getName(): string {
    return `OpenAI (${this.model})`;
  }

  async *streamChat(
    messages: ChatMessage[],
    systemPrompt?: string
  ): AsyncIterable<StreamChunk> {
    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      allMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    allMessages.push(
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))
    );

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: allMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield {
            content,
            done: false,
          };
        }
      }

      yield {
        content: '',
        done: true,
      };
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error(
        `Failed to get response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
