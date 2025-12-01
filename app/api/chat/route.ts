import { NextRequest } from 'next/server';
import { createAIProvider, type ChatMessage } from '@/lib/ai/providers';
import { getBookSystemPrompt } from '@/lib/ai/context-guard';
import { SessionManager } from '@/lib/session/manager';
import {
  saveMessage,
  getConversationHistory,
  logAnalyticsEvent,
} from '@/lib/db/queries';
import { errorResponse, streamResponse } from '@/lib/utils/response';

export const runtime = 'edge';

interface ChatRequest {
  message: string;
  sessionId?: string;
  includeHistory?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();
    const { message, sessionId, includeHistory = true } = body;

    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required', 400);
    }

    // Validate session ID format if provided
    if (sessionId && !SessionManager.isValidSessionId(sessionId)) {
      return errorResponse('Invalid session ID format', 400);
    }

    // Get or create session
    const session = await SessionManager.getOrCreateSession(sessionId);

    // Save user message to database
    await saveMessage(session.id, 'user', message, {
      timestamp: new Date().toISOString(),
    });

    // Log analytics event for user query
    await logAnalyticsEvent(session.id, 'user_message', {
      messageLength: message.length,
      hasHistory: includeHistory,
    });

    // Build conversation history
    const conversationHistory: ChatMessage[] = [];

    if (includeHistory) {
      const history = await getConversationHistory(session.id);
      // Add previous messages (excluding the one we just saved)
      conversationHistory.push(
        ...history.slice(0, -1).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
    }

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Create AI provider
    const aiProvider = createAIProvider();
    const systemPrompt = getBookSystemPrompt();

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream AI response
          for await (const chunk of aiProvider.streamChat(
            conversationHistory,
            systemPrompt
          )) {
            if (!chunk.done && chunk.content) {
              fullResponse += chunk.content;

              // Send chunk to client in SSE format
              const data = JSON.stringify({
                content: chunk.content,
                done: false,
                sessionId: session.id,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }

            if (chunk.done) {
              // Save assistant response to database
              await saveMessage(session.id, 'assistant', fullResponse, {
                model: aiProvider.getName(),
                timestamp: new Date().toISOString(),
                messageLength: fullResponse.length,
              });

              // Log completion analytics
              await logAnalyticsEvent(session.id, 'assistant_response', {
                responseLength: fullResponse.length,
                model: aiProvider.getName(),
              });

              // Send final message
              const finalData = JSON.stringify({
                content: '',
                done: true,
                sessionId: session.id,
                metadata: {
                  model: aiProvider.getName(),
                  responseLength: fullResponse.length,
                },
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
              controller.close();
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);

          // Log error analytics
          await logAnalyticsEvent(session.id, 'error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stage: 'streaming',
          });

          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Streaming failed',
            done: true,
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return streamResponse(stream);
  } catch (error) {
    console.error('Chat API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://shehzadanjum.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
