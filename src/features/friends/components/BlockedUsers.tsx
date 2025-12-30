import React, { useEffect, useState } from 'react';
import { ShieldX, UserPlus } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
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
import { toast } from 'sonner';

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<FriendshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockDialog, setUnblockDialog] = useState<{
    isOpen: boolean;
    user: FriendshipResponse | null;
  }>({
    isOpen: false,
    user: null,
  });

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const data = await FriendshipService.getBlockedUsers();
      setBlockedUsers(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách người dùng bị chặn');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!unblockDialog.user) return;

    try {
      await FriendshipService.unblockUser(unblockDialog.user.userId);
      toast.success(`Đã bỏ chặn ${unblockDialog.user.username}`);
      setBlockedUsers((prev) =>
        prev.filter((u) => u.userId !== unblockDialog.user?.userId)
      );
    } catch (error: any) {
      toast.error(error.message || 'Không thể bỏ chặn người dùng');
    } finally {
      setUnblockDialog({ isOpen: false, user: null });
    }
  };

  const getInitials = (user: FriendshipResponse) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (user: FriendshipResponse) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
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
      {/* Blocked users count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldX className="h-4 w-4" />
        <span>{blockedUsers.length} người dùng bị chặn</span>
      </div>

      {/* Blocked users list */}
      {blockedUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Bạn chưa chặn người dùng nào
        </div>
      ) : (
        <div className="space-y-2">
          {blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 opacity-60">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback className="bg-gray-400 text-white text-sm">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-muted-foreground">
                    {getDisplayName(user)}
                  </p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnblockDialog({ isOpen: true, user })}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Bỏ chặn
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Unblock Dialog */}
      <AlertDialog
        open={unblockDialog.isOpen}
        onOpenChange={(open: boolean) =>
          !open && setUnblockDialog({ isOpen: false, user: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ chặn người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn bỏ chặn {unblockDialog.user?.username}? Họ sẽ có thể
              gửi lời mời kết bạn và nhắn tin cho bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>Bỏ chặn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
