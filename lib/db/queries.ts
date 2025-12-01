import { sql } from '@vercel/postgres';

export interface Session {
  id: string;
  created_at: Date;
  last_active: Date;
  user_metadata: Record<string, any>;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: string;
  data: Record<string, any>;
  timestamp: Date;
}

/**
 * Create a new chat session
 */
export async function createSession(userMetadata: Record<string, any> = {}): Promise<Session> {
  const result = await sql<Session>`
    INSERT INTO sessions (user_metadata)
    VALUES (${JSON.stringify(userMetadata)}::jsonb)
    RETURNING *
  `;
  return result.rows[0];
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await sql<Session>`
    SELECT * FROM sessions WHERE id = ${sessionId}
  `;
  return result.rows[0] || null;
}

/**
 * Save a message to the database
 */
export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata: Record<string, any> = {}
): Promise<Message> {
  const result = await sql<Message>`
    INSERT INTO messages (session_id, role, content, metadata)
    VALUES (${sessionId}, ${role}, ${content}, ${JSON.stringify(metadata)}::jsonb)
    RETURNING *
  `;
  return result.rows[0];
}

/**
 * Get conversation history for a session
 */
export async function getConversationHistory(
  sessionId: string,
  limit: number = 50
): Promise<Message[]> {
  const result = await sql<Message>`
    SELECT * FROM messages
    WHERE session_id = ${sessionId}
    ORDER BY timestamp ASC
    LIMIT ${limit}
  `;
  return result.rows;
}

/**
 * Log an analytics event
 */
export async function logAnalyticsEvent(
  sessionId: string,
  eventType: string,
  data: Record<string, any> = {}
): Promise<AnalyticsEvent> {
  const result = await sql<AnalyticsEvent>`
    INSERT INTO analytics_events (session_id, event_type, data)
    VALUES (${sessionId}, ${eventType}, ${JSON.stringify(data)}::jsonb)
    RETURNING *
  `;
  return result.rows[0];
}

/**
 * Get analytics for a session
 */
export async function getSessionAnalytics(sessionId: string): Promise<AnalyticsEvent[]> {
  const result = await sql<AnalyticsEvent>`
    SELECT * FROM analytics_events
    WHERE session_id = ${sessionId}
    ORDER BY timestamp ASC
  `;
  return result.rows;
}

/**
 * Get session statistics
 */
export async function getSessionStats(sessionId: string) {
  const messageCountResult = await sql`
    SELECT COUNT(*) as total, role
    FROM messages
    WHERE session_id = ${sessionId}
    GROUP BY role
  `;

  const session = await getSession(sessionId);

  return {
    session,
    messageCount: messageCountResult.rows.reduce((acc, row) => {
      acc[row.role] = parseInt(row.total);
      return acc;
    }, {} as Record<string, number>),
    totalMessages: messageCountResult.rows.reduce((sum, row) => sum + parseInt(row.total), 0),
  };
}
