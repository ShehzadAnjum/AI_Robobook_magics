import { NextRequest } from 'next/server';
import {
  getSession,
  getSessionAnalytics,
  getSessionStats,
} from '@/lib/db/queries';
import { SessionManager } from '@/lib/session/manager';
import { jsonResponse, errorResponse } from '@/lib/utils/response';

export const runtime = 'edge';

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * GET /api/analytics/:sessionId
 * Retrieve learning analytics for a session
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

    // Get analytics events and session stats
    const [analyticsEvents, sessionStats] = await Promise.all([
      getSessionAnalytics(sessionId),
      getSessionStats(sessionId),
    ]);

    // Calculate learning metrics
    const userMessageCount = sessionStats.messageCount.user || 0;
    const assistantMessageCount = sessionStats.messageCount.assistant || 0;

    const engagementMetrics = {
      totalMessages: sessionStats.totalMessages,
      userMessages: userMessageCount,
      assistantMessages: assistantMessageCount,
      averageMessageLength: 0, // Can be calculated from events
    };

    // Group events by type
    const eventsByType = analyticsEvents.reduce((acc, event) => {
      if (!acc[event.event_type]) {
        acc[event.event_type] = [];
      }
      acc[event.event_type].push({
        timestamp: event.timestamp,
        data: event.data,
      });
      return acc;
    }, {} as Record<string, Array<{ timestamp: Date; data: any }>>);

    // Calculate session duration
    const sessionDuration = session.last_active.getTime() - session.created_at.getTime();

    return jsonResponse({
      sessionId,
      session: {
        createdAt: session.created_at,
        lastActive: session.last_active,
        duration: sessionDuration,
        durationMinutes: Math.round(sessionDuration / 60000),
      },
      engagement: engagementMetrics,
      events: eventsByType,
      totalEvents: analyticsEvents.length,
      insights: generateInsights(engagementMetrics, eventsByType, sessionDuration),
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
}

/**
 * Generate learning insights based on analytics data
 */
function generateInsights(
  engagement: any,
  events: Record<string, any[]>,
  duration: number
): string[] {
  const insights: string[] = [];

  // Engagement insights
  if (engagement.userMessages > 10) {
    insights.push('High engagement: Asked many questions, showing active learning');
  } else if (engagement.userMessages < 3) {
    insights.push('Getting started: Early in learning journey');
  }

  // Session duration insights
  const durationMinutes = duration / 60000;
  if (durationMinutes > 30) {
    insights.push('Deep dive session: Spent significant time exploring topics');
  } else if (durationMinutes < 5) {
    insights.push('Quick check-in: Brief learning session');
  }

  // Error patterns
  if (events.error && events.error.length > 0) {
    insights.push('Encountered some technical issues during session');
  }

  return insights;
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
