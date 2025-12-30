import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserMinus, Ban, MoreVertical, Search } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../shared/components/ui/alert-dialog';
import { FriendshipResponse } from '../types/friendship.types';
import { FriendshipService } from '../services/friendship.service';
import { StartChatButton } from '../../chat';
import { toast } from 'sonner';

interface FriendsListProps {
  onStartChat?: (userId: string, username: string) => void;
}

export default function FriendsList({ onStartChat }: FriendsListProps) {
  const [friends, setFriends] = useState<FriendshipResponse[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<FriendshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'unfriend' | 'block';
    friend: FriendshipResponse | null;
  }>({
    isOpen: false,
    type: 'unfriend',
    friend: null,
  });

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFriends(
        friends.filter(
          (friend) =>
            friend.username.toLowerCase().includes(query) ||
            friend.firstName?.toLowerCase().includes(query) ||
            friend.lastName?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, friends]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await FriendshipService.getFriends();
      setFriends(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách bạn bè');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!confirmDialog.friend) return;

    try {
      await FriendshipService.unfriend(confirmDialog.friend.userId);
      toast.success('Đã hủy kết bạn');
      setFriends((prev) => prev.filter((f) => f.userId !== confirmDialog.friend?.userId));
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy kết bạn');
    } finally {
      setConfirmDialog({ isOpen: false, type: 'unfriend', friend: null });
    }
  };

  const handleBlock = async () => {
    if (!confirmDialog.friend) return;

    try {
      await FriendshipService.blockUser(confirmDialog.friend.userId);
      toast.success('Đã chặn người dùng');
      setFriends((prev) => prev.filter((f) => f.userId !== confirmDialog.friend?.userId));
    } catch (error: any) {
      toast.error(error.message || 'Không thể chặn người dùng');
    } finally {
      setConfirmDialog({ isOpen: false, type: 'block', friend: null });
    }
  };

  const getInitials = (friend: FriendshipResponse) => {
    if (friend.firstName && friend.lastName) {
      return `${friend.firstName[0]}${friend.lastName[0]}`.toUpperCase();
    }
    return friend.username.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (friend: FriendshipResponse) => {
    if (friend.firstName && friend.lastName) {
      return `${friend.firstName} ${friend.lastName}`;
    }
    return friend.username;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bạn bè..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Friends count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{friends.length} bạn bè</span>
      </div>

      {/* Friends list */}
      {filteredFriends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? 'Không tìm thấy bạn bè nào' : 'Bạn chưa có bạn bè nào'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Link to={`/profile/${friend.userId}`}>
                  <Avatar className="h-10 w-10 hover:ring-2 hover:ring-blue-300 transition-all">
                    <AvatarImage src={friend.avatarUrl} alt={friend.username} />
                    <AvatarFallback className="bg-gradient-to-br from-red-400 to-yellow-400 text-white text-sm">
                      {getInitials(friend)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link to={`/profile/${friend.userId}`} className="hover:text-blue-600 transition-colors">
                  <p className="font-medium">{getDisplayName(friend)}</p>
                  <p className="text-sm text-muted-foreground">@{friend.username}</p>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <StartChatButton
                  userId={friend.userId}
                  userName={getDisplayName(friend)}
                  variant="ghost"
                  size="icon"
                  showIcon={true}
                  className="h-9 w-9"
                >
                  <span className="sr-only">Nhắn tin</span>
                </StartChatButton>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, type: 'unfriend', friend })
                      }
                      className="text-orange-600"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Hủy kết bạn
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, type: 'block', friend })
                      }
                      className="text-red-600"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Chặn
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open: boolean) =>
          !open && setConfirmDialog({ isOpen: false, type: 'unfriend', friend: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'unfriend' ? 'Hủy kết bạn' : 'Chặn người dùng'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'unfriend'
                ? `Bạn có chắc muốn hủy kết bạn với ${confirmDialog.friend?.username}?`
                : `Bạn có chắc muốn chặn ${confirmDialog.friend?.username}? Họ sẽ không thể gửi lời mời kết bạn hoặc nhắn tin cho bạn.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.type === 'unfriend' ? handleUnfriend : handleBlock}
              className={
                confirmDialog.type === 'block'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {confirmDialog.type === 'unfriend' ? 'Hủy kết bạn' : 'Chặn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
