import { ApiService } from '../../../shared/services/api.service';
import type { Session } from '../types/auth.types';

export class SessionService {
  /**
   * Get all active sessions
   */
  static async getAllSessions(): Promise<Session[]> {
    return ApiService.get<Session[]>('/auth/sessions', true);
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string): Promise<void> {
    return ApiService.delete<void>(`/auth/sessions/${sessionId}`, true);
  }

  /**
   * Revoke all sessions
   */
  static async revokeAllSessions(): Promise<void> {
    return ApiService.delete<void>('/auth/sessions', true);
  }
}
