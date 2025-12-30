import { ApiService } from '../../../shared/services/api.service';
import { FriendshipResponse, FriendshipStatusResponse } from '../types/friendship.types';

export class FriendshipService {
  /**
   * Check friendship status with another user
   */
  static async checkFriendshipStatus(userId: string): Promise<FriendshipStatusResponse> {
    return ApiService.get<FriendshipStatusResponse>(`/friends/status/${userId}`, true);
  }

  /**
   * Send friend request to a user
   */
  static async sendFriendRequest(userId: string): Promise<FriendshipResponse> {
    return ApiService.post<FriendshipResponse>(`/friends/request/${userId}`, {}, true);
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(friendshipId: string): Promise<FriendshipResponse> {
    return ApiService.post<FriendshipResponse>(`/friends/accept/${friendshipId}`, {}, true);
  }

  /**
   * Reject a friend request
   */
  static async rejectFriendRequest(friendshipId: string): Promise<void> {
    return ApiService.post<void>(`/friends/reject/${friendshipId}`, {}, true);
  }

  /**
   * Unfriend a user
   */
  static async unfriend(userId: string): Promise<void> {
    return ApiService.delete<void>(`/friends/${userId}`, true);
  }

  /**
   * Block a user
   */
  static async blockUser(userId: string): Promise<void> {
    return ApiService.post<void>(`/friends/block/${userId}`, {}, true);
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: string): Promise<void> {
    return ApiService.delete<void>(`/friends/unblock/${userId}`, true);
  }

  /**
   * Get list of friends
   */
  static async getFriends(): Promise<FriendshipResponse[]> {
    return ApiService.get<FriendshipResponse[]>('/friends', true);
  }

  /**
   * Get received friend requests
   */
  static async getReceivedRequests(): Promise<FriendshipResponse[]> {
    return ApiService.get<FriendshipResponse[]>('/friends/requests/received', true);
  }

  /**
   * Get sent friend requests
   */
  static async getSentRequests(): Promise<FriendshipResponse[]> {
    return ApiService.get<FriendshipResponse[]>('/friends/requests/sent', true);
  }

  /**
   * Get blocked users
   */
  static async getBlockedUsers(): Promise<FriendshipResponse[]> {
    return ApiService.get<FriendshipResponse[]>('/friends/blocked', true);
  }
}
