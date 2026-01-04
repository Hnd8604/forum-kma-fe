import { useEffect, useState, useCallback } from 'react';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/types/auth.types';
import { FriendshipService } from '../services/friendship.service';

export interface FriendSuggestion {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function useFriendSuggestions() {
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy tất cả user
      const { content: allUsers } = await AuthService.getAllUsers(0, 100);
      // Lấy danh sách bạn bè
      const friends = await FriendshipService.getFriends();
      // Lấy lời mời đã gửi và đã nhận (pending)
      const [sentRequests, receivedRequests] = await Promise.all([
        FriendshipService.getSentRequests(),
        FriendshipService.getReceivedRequests(),
      ]);
      // Lấy user hiện tại
      const currentUser = AuthService.getCurrentUser ? AuthService.getCurrentUser() : null;

      // Tạo set các userId cần loại trừ
      const friendIds = new Set(friends.map(f => f.userId));
      const sentRequestIds = new Set(sentRequests.map(r => r.userId));
      const receivedRequestIds = new Set(receivedRequests.map(r => r.userId));

      // Lọc user chưa là bạn, không phải chính mình, và không có lời mời đang chờ
      const nonFriends = allUsers.filter(
        (user: User) =>
          user.userId !== currentUser?.userId &&
          !friendIds.has(user.userId) &&
          !sentRequestIds.has(user.userId) &&
          !receivedRequestIds.has(user.userId)
      );

      // Map to FriendSuggestion và random 3 user
      const suggestionList: FriendSuggestion[] = nonFriends.map((user: User) => ({
        userId: user.userId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      }));

      const randomSuggestions = shuffleArray(suggestionList).slice(0, 3);
      setSuggestions(randomSuggestions);
    } catch (err: any) {
      console.error('[Gợi ý kết bạn] Error:', err);
      setError(err?.message || 'Lỗi khi lấy gợi ý kết bạn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Cho phép refresh lại danh sách gợi ý
  const refresh = useCallback(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return { suggestions, loading, error, refresh };
}
