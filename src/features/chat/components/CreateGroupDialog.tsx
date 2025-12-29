import { useState } from 'react';
import { ChatService } from '../services/chat.service';
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
import { X } from 'lucide-react';

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
  const [memberIds, setMemberIds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClose = () => {
    setGroupName('');
    setMemberIds(['']);
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  const handleAddMember = () => {
    setMemberIds([...memberIds, '']);
  };

  const handleRemoveMember = (index: number) => {
    setMemberIds(memberIds.filter((_, i) => i !== index));
  };

  const handleMemberIdChange = (index: number, value: string) => {
    const newMemberIds = [...memberIds];
    newMemberIds[index] = value;
    setMemberIds(newMemberIds);
  };

  const handleCreateGroup = async () => {
    setError('');
    setSuccess('');

    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm');
      return;
    }

    const validMemberIds = memberIds.map((id) => id.trim()).filter((id) => id.length > 0);

    if (validMemberIds.length === 0) {
      setError('Vui lòng thêm ít nhất một thành viên');
      return;
    }

    setLoading(true);

    try {
      await ChatService.createGroup({
        name: groupName.trim(),
        memberIds: validMemberIds,
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
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tạo nhóm chat mới</DialogTitle>
          <DialogDescription className="text-base">
            Nhập tên nhóm và thêm thành viên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <Label>Thành viên</Label>
            <div className="space-y-2">
              {memberIds.map((memberId, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={memberId}
                    onChange={(e) => handleMemberIdChange(index, e.target.value)}
                    placeholder="Nhập User ID"
                    disabled={loading}
                    className="h-11"
                  />
                  {memberIds.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(index)}
                      disabled={loading}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddMember}
              disabled={loading}
              className="w-full"
            >
              + Thêm thành viên
            </Button>
            <p className="text-xs text-gray-500">Bạn sẽ tự động được thêm vào nhóm</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleCreateGroup} disabled={loading} className="min-w-[120px]">
            {loading ? 'Đang tạo...' : 'Tạo nhóm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
