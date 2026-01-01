import { useState, useEffect } from 'react';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import type { User } from '../../auth/types/auth.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { X, Search, UserPlus, Check } from 'lucide-react';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function CreateGroupDialog({
  isOpen,
  onClose,
  onGroupCreated,
}: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await AuthService.getAllUsers(0, 50);
        const query = searchQuery.toLowerCase().trim();
        
        const filtered = response.content.filter(user => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
          const username = (user.username || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          
          return fullName.includes(query) || username.includes(query) || email.includes(query);
        });

        setSearchResults(filtered.slice(0, 10));
      } catch (err) {
        console.error('Failed to search users:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleClose = () => {
    setGroupName('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMembers([]);
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  const handleToggleMember = (user: User) => {
    const isSelected = selectedMembers.some(m => m.userId === user.userId);
    
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.userId !== user.userId));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const isUserSelected = (userId: string) => {
    return selectedMembers.some(m => m.userId === userId);
  };

  const handleCreateGroup = async () => {
    setError('');
    setSuccess('');

    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Vui lòng thêm ít nhất một thành viên');
      return;
    }

    setLoading(true);

    try {
      await ChatService.createGroup({
        name: groupName.trim(),
        memberIds: selectedMembers.map(m => m.userId),
      });

      setSuccess('Tạo nhóm chat thành công!');
      setTimeout(() => {
        handleClose();
        onGroupCreated?.();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to create group:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl">Tạo nhóm chat mới</DialogTitle>
          <DialogDescription className="text-base">
            Nhập tên nhóm và thêm thành viên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="groupName">Tên nhóm</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm chat"
              disabled={loading}
              autoFocus
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Thành viên ({selectedMembers.length})</Label>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                {selectedMembers.map((member) => {
                  const displayName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.username;
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-300 shadow-sm"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{displayName}</span>
                      <button
                        onClick={() => handleToggleMember(member)}
                        className="hover:bg-red-100 rounded-full p-0.5"
                        disabled={loading}
                      >
                        <X className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm người dùng..."
                disabled={loading}
                className="h-11 pl-10"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <ScrollArea className="h-[200px] border rounded-lg">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <UserPlus className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Không tìm thấy người dùng</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.map((user) => {
                      const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
                      const isSelected = isUserSelected(user.userId);
                      
                      return (
                        <div
                          key={user.userId}
                          onClick={() => handleToggleMember(user)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border border-blue-300' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl} alt={displayName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                              {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{displayName}</p>
                            {user.email && (
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            )}
            
            <p className="text-xs text-gray-500">Bạn sẽ tự động được thêm vào nhóm</p>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleCreateGroup} disabled={loading || selectedMembers.length === 0} className="min-w-[120px]">
            {loading ? 'Đang tạo...' : 'Tạo nhóm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
