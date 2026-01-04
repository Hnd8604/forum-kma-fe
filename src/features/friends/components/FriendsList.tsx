import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserMinus, Ban, MoreVertical, Search, MessageCircle, UserX } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <p className="mt-4 text-slate-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-700">{friends.length}</span>
          <span className="text-slate-500">bạn bè</span>
        </div>
      </div>

      {/* Friends Grid */}
      {filteredFriends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
            <UserX className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
          </h3>
          <p className="text-slate-500 max-w-sm">
            {searchQuery
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Hãy kết bạn với những người dùng khác để bắt đầu trò chuyện!'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-100 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <Link to={`/profile/${friend.userId}`}>
                  <Avatar className="h-14 w-14 ring-4 ring-slate-100 group-hover:ring-blue-100 transition-all">
                    <AvatarImage src={friend.avatarUrl} alt={friend.username} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                      {getInitials(friend)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${friend.userId}`} className="hover:text-blue-600 transition-colors">
                    <h3 className="font-semibold text-slate-900 truncate">{getDisplayName(friend)}</h3>
                    <p className="text-sm text-slate-500 truncate">@{friend.username}</p>
                  </Link>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border-slate-200">
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, type: 'unfriend', friend })
                      }
                      className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Hủy kết bạn
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmDialog({ isOpen: true, type: 'block', friend })
                      }
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Chặn người này
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <StartChatButton
                  userId={friend.userId}
                  userName={getDisplayName(friend)}
                  variant="outline"
                  size="sm"
                  showIcon={true}
                  className="flex-1 rounded-xl h-9 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                />
                <Link to={`/profile/${friend.userId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    Xem trang
                  </Button>
                </Link>
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
        <AlertDialogContent className="rounded-2xl bg-white shadow-2xl border-slate-100 p-6 sm:max-w-[400px]">
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
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.type === 'unfriend' ? handleUnfriend : handleBlock}
              className={`rounded-xl ${confirmDialog.type === 'block'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-orange-600 hover:bg-orange-700'
                }`}
            >
              {confirmDialog.type === 'unfriend' ? 'Hủy kết bạn' : 'Chặn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
