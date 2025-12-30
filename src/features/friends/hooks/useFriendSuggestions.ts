import { useEffect, useState } from 'react';
import { AuthService, User } from '@/features/auth/services/auth.service';
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

  useEffect(() => {
    let isMounted = true;
    async function fetchSuggestions() {
      setLoading(true);
      setError(null);
      try {
        // Lấy tất cả user
        const { content: allUsers } = await AuthService.getAllUsers(0, 100);
        // Lấy danh sách bạn bè
        const friends = await FriendshipService.getFriends();
        // Lấy user hiện tại
        const currentUser = AuthService.getCurrentUser ? AuthService.getCurrentUser() : null;
        const friendIds = new Set(friends.map(f => f.userId));
        // Lọc user chưa là bạn và không phải chính mình
        const nonFriends = allUsers.filter(
          user => user.userId !== currentUser?.userId && !friendIds.has(user.userId)
        );
        // Debug log
        console.log('[Gợi ý kết bạn] allUsers:', allUsers);
        console.log('[Gợi ý kết bạn] friends:', friends);
        console.log('[Gợi ý kết bạn] currentUser:', currentUser);
        console.log('[Gợi ý kết bạn] nonFriends:', nonFriends);
        // Random 3 user
        const randomSuggestions = shuffleArray(nonFriends).slice(0, 3);
        if (isMounted) setSuggestions(randomSuggestions);
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Lỗi khi lấy gợi ý kết bạn');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSuggestions();
    return () => { isMounted = false; };
  }, []);

  return { suggestions, loading, error };
}
