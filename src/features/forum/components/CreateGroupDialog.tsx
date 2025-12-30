import { useState } from 'react';
import { X, Globe, Lock, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { GroupService } from '../services/group.service';
import type { GroupPrivacy } from '../types/post.types';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function CreateGroupDialog({ isOpen, onClose, onGroupCreated }: CreateGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<GroupPrivacy>('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Tên nhóm không được để trống');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await GroupService.createGroup({
        groupName: name.trim(),
        description: description.trim(),
        visibility: privacy,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setPrivacy('PUBLIC');
      
      onGroupCreated?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create group:', err);
      setError(err.message || 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Tạo nhóm mới</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nhóm..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={100}
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả về nhóm của bạn..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              maxLength={500}
            />
          </div>
          
          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quyền riêng tư
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPrivacy('PUBLIC')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  privacy === 'PUBLIC'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  privacy === 'PUBLIC' ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Globe className={`w-5 h-5 ${
                    privacy === 'PUBLIC' ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-slate-900">Công khai</div>
                  <div className="text-sm text-slate-500">Ai cũng có thể xem và tham gia</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setPrivacy('PRIVATE')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  privacy === 'PRIVATE'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  privacy === 'PRIVATE' ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Lock className={`w-5 h-5 ${
                    privacy === 'PRIVATE' ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-slate-900">Riêng tư</div>
                  <div className="text-sm text-slate-500">Chỉ thành viên mới có thể xem</div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo nhóm'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
