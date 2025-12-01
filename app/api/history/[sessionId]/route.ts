import { NextRequest } from 'next/server';
import { getConversationHistory, getSession } from '@/lib/db/queries';
import { SessionManager } from '@/lib/session/manager';
import { jsonResponse, errorResponse } from '@/lib/utils/response';

export const runtime = 'edge';

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * GET /api/history/:sessionId
 * Retrieve conversation history for a session
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { sessionId } = await context.params;

    // Validate session ID format
    if (!SessionManager.isValidSessionId(sessionId)) {
      return errorResponse('Invalid session ID format', 400);
    }

    // Check if session exists
    const session = await getSession(sessionId);
    if (!session) {
      return errorResponse('Session not found', 404);
    }

    // Get conversation history
    const history = await getConversationHistory(sessionId);

    return jsonResponse({
      sessionId,
      session: {
        createdAt: session.created_at,
        lastActive: session.last_active,
      },
      messages: history.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
      })),
      totalMessages: history.length,
    });
  } catch (error) {
    console.error('History API error:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
