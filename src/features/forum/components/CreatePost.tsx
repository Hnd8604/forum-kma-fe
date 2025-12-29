import { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Input } from '../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Image, Link2, Smile, X, Loader2, FileText, Upload } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';
import { PostService } from '../services/post.service';
import { GroupService } from '../services/group.service';
import { ApiService } from '../../../shared/services/api.service';
import type { Group, PostType } from '../types/post.types';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [resourceUrl, setResourceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (isExpanded && groups.length === 0) {
      loadGroups();
    }
  }, [isExpanded]);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const groups = await GroupService.getMyGroups({ limit: 50 });
      setGroups(groups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setGroups([]); // Set empty array on error
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      let finalResourceUrl = resourceUrl;

      // Upload file if selected
      if (selectedFile && postType !== 'TEXT') {
        setUploading(true);
        try {
          // Determine upload endpoint based on post type
          const uploadEndpoint = postType === 'IMAGE' 
            ? '/files/upload/image' 
            : '/files/upload/document';
          
          const uploadResult = await ApiService.uploadFile<{ 
            fileName: string;
            fileUrl: string;
            fileSize: number;
            contentType: string;
            uploadedAt: string;
          }>(
            uploadEndpoint,
            selectedFile
          );
          
          finalResourceUrl = uploadResult.fileUrl;
        } catch (uploadErr: any) {
          console.error('File upload failed:', uploadErr);
          throw new Error(uploadErr.message || 'Không thể tải file lên. Vui lòng thử lại.');
        } finally {
          setUploading(false);
        }
      }

      await PostService.createPost({
        title: title.trim(),
        content: content.trim(),
        groupId: selectedGroupId || undefined,
        type: postType,
        resourceUrl: postType !== 'TEXT' ? finalResourceUrl : undefined,
      });

      // Reset form
      setTitle('');
      setContent('');
      setSelectedGroupId('');
      setPostType('TEXT');
      setResourceUrl('');
      setSelectedFile(null);
      setIsExpanded(false);

      // Notify parent
      onPostCreated?.();
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Không thể đăng bài viết');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';
  };

  return (
    <Card className="p-5 bg-white/80 backdrop-blur-sm border border-red-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-yellow-400 flex items-center justify-center shadow-md ring-2 ring-white group-hover:scale-110 transition-transform">
            <span className="text-white text-sm font-medium">{getInitials()}</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-gray-100 to-red-50/50 rounded-full px-5 py-3 text-gray-500 hover:from-gray-200 hover:to-red-100/50 transition-all">
            Bạn đang nghĩ gì? ✨
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-yellow-400 flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white text-sm font-medium">{getInitials()}</span>
              </div>
              <div>
                <p className="font-medium">Tạo bài viết mới</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsExpanded(false);
                setTitle('');
                setContent('');
                setError(null);
              }}
              className="rounded-lg hover:bg-red-50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            placeholder="Tiêu đề bài viết..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-gray-300 rounded-xl h-12 focus:border-red-300 focus:ring-red-200"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="border-gray-300 rounded-xl h-12 focus:border-red-300 focus:ring-red-200">
                <SelectValue placeholder={loadingGroups ? 'Đang tải...' : 'Chọn nhóm'} />
              </SelectTrigger>
              <SelectContent>
                {groups && groups.length > 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.groupId} value={group.groupId}>
                      {group.groupName || group.name || 'Unnamed Group'}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    {loadingGroups ? 'Đang tải...' : 'Không có nhóm'}
                  </div>
                )}
              </SelectContent>
            </Select>

            <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
              <SelectTrigger className="border-gray-300 rounded-xl h-12 focus:border-red-300 focus:ring-red-200">
                <SelectValue placeholder="Loại bài viết" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Văn bản</SelectItem>
                <SelectItem value="IMAGE">Hình ảnh</SelectItem>
                <SelectItem value="DOC">Tài liệu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {postType !== 'TEXT' && (
            <div className="space-y-3">
              {/* File Upload Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-red-300 transition-colors">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? (
                        <span className="text-red-600 font-medium">
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                        </span>
                      ) : (
                        <>
                          Nhấp để chọn {postType === 'IMAGE' ? 'hình ảnh' : 'tài liệu'}
                          <span className="text-xs text-gray-500 block mt-1">
                            hoặc kéo thả file vào đây
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept={postType === 'IMAGE' ? 'image/*' : '.pdf,.doc,.docx,.txt,.zip'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setResourceUrl(''); // Clear URL when file is selected
                    }
                  }}
                  className="hidden"
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="w-full mt-2 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa file
                  </Button>
                )}
              </div>

              {/* Fallback URL Input (if no file selected) */}
              {!selectedFile && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 text-center">hoặc nhập URL</p>
                  <Input
                    placeholder={postType === 'IMAGE' ? 'URL hình ảnh...' : 'URL tài liệu...'}
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    className="border-gray-300 rounded-xl h-12 focus:border-red-300 focus:ring-red-200"
                  />
                </div>
              )}
            </div>
          )}

          <Textarea
            placeholder="Nội dung bài viết của bạn... 💭"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[140px] border-gray-300 resize-none rounded-xl focus:border-red-300 focus:ring-red-200"
          />

          <div className="flex items-center justify-between pt-3 border-t border-red-100">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPostType('IMAGE')}
                className={`rounded-lg transition-colors ${
                  postType === 'IMAGE' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Image className="w-4 h-4 mr-2" />
                Ảnh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPostType('DOC')}
                className={`rounded-lg transition-colors ${
                  postType === 'DOC' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Tài liệu
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors">
                <Smile className="w-4 h-4 mr-2" />
                Emoji
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setContent('');
                  setError(null);
                }}
                className="rounded-xl hover:bg-gray-50"
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={
                  !title.trim() ||
                  !content.trim() ||
                  submitting ||
                  uploading ||
                  (postType !== 'TEXT' && !selectedFile && !resourceUrl)
                }
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải lên...
                  </>
                ) : submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  'Đăng bài'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}