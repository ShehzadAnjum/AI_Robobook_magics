import { v4 as uuidv4 } from 'uuid';
import { createSession, getSession } from '../db/queries';
import type { Session } from '../db/queries';

/**
 * Session Manager
 * Handles session creation and validation
 */

export class SessionManager {
  /**
   * Get or create a session
   * If sessionId is provided and valid, returns existing session
   * Otherwise creates a new session
   */
  static async getOrCreateSession(sessionId?: string): Promise<Session> {
    // If sessionId provided, try to fetch it
    if (sessionId) {
      const existingSession = await getSession(sessionId);
      if (existingSession) {
        return existingSession;
      }
      console.warn(`Session ${sessionId} not found, creating new session`);
    }

    // Create new session
    return await createSession({
      created_via: 'api',
      user_agent: 'web',
    });
  }

  /**
   * Validate session ID format (UUID v4)
   */
  static isValidSessionId(sessionId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sessionId);
  }

  /**
   * Generate a new session ID
   */
  static generateSessionId(): string {
    return uuidv4();
  }
}
