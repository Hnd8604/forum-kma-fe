import { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Input } from '../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Image, X, Loader2, FileText, Upload, File } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';
import { PostService } from '../services/post.service';
import { GroupService } from '../services/group.service';
import { ApiService } from '../../../shared/services/api.service';
import type { Group, PostType, ApiPost } from '../types/post.types';

interface SelectedFileWithPreview {
  file: File;
  preview?: string; // URL for image preview
  id: string; // Unique ID for each file
}

interface CreatePostProps {
  onPostCreated?: (post?: ApiPost) => void;
  defaultGroupId?: string;
}

export default function CreatePost({ onPostCreated, defaultGroupId }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId || '');
  const [postType, setPostType] = useState<PostType>('TEXT');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const user = useAuthStore((state) => state.user);

  // Cleanup preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, []);

  // Update selectedGroupId when defaultGroupId changes
  useEffect(() => {
    if (defaultGroupId) {
      setSelectedGroupId(defaultGroupId);
    }
  }, [defaultGroupId]);

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
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleFilesSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: SelectedFileWithPreview[] = [];

    Array.from(files).forEach((file) => {
      const fileWithPreview: SelectedFileWithPreview = {
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Create preview URL for images
      if (postType === 'IMAGE' && file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      newFiles.push(fileWithPreview);
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const clearAllFiles = () => {
    selectedFiles.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setSelectedFiles([]);
  };

  const handleSubmit = async () => {
    // Validate title is required
    if (!title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }

    // For TEXT posts, content is required
    if (postType === 'TEXT' && !content.trim()) {
      setError('Nội dung không được để trống');
      return;
    }

    // For IMAGE/DOC posts, need file
    if (postType !== 'TEXT' && selectedFiles.length === 0) {
      setError('Vui lòng tải lên ít nhất một file');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      // Upload all files
      if (selectedFiles.length > 0 && postType !== 'TEXT') {
        setUploading(true);
        try {
          const uploadEndpoint = postType === 'IMAGE'
            ? '/files/upload/image'
            : '/files/upload/document';

          for (const fileItem of selectedFiles) {
            const uploadResult = await ApiService.uploadFile<{
              resourceUrl: string;
            }>(
              uploadEndpoint,
              fileItem.file
            );
            uploadedUrls.push(uploadResult.resourceUrl);
          }
        } catch (uploadErr: any) {
          console.error('File upload failed:', uploadErr);
          throw new Error(uploadErr.message || 'Không thể tải file lên. Vui lòng thử lại.');
        } finally {
          setUploading(false);
        }
      }

      // Create post with uploaded URLs
      const postData: any = {
        title: title.trim(),
        content: content.trim() || '',
        type: postType,
      };

      // Add groupId if selected
      if (selectedGroupId) {
        postData.groupId = selectedGroupId;
      }

      // Add resourceUrls for IMAGE and DOC posts (backend expects an array)
      if (postType !== 'TEXT' && uploadedUrls.length > 0) {
        postData.resourceUrls = uploadedUrls;
      }

      const newPost = await PostService.createPost(postData);

      setTitle('');
      setContent('');
      setSelectedGroupId('');
      setPostType('TEXT');
      clearAllFiles();
      setIsExpanded(false);

      onPostCreated?.(newPost);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Không thể đăng bài viết');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 mb-5 shadow-sm hover:shadow-md transition-shadow">
      {!isExpanded ? (
        <div className="flex items-center p-3 gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <span className="text-white text-sm font-bold">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>

          {/* Input Box */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex-1 bg-slate-100 hover:bg-slate-50 border-2 border-transparent hover:border-blue-200 rounded-xl px-4 py-3 cursor-text text-sm text-slate-500 transition-all"
          >
            Bạn đang nghĩ gì?
          </div>

          {/* Quick Actions */}
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
            onClick={() => {
              setPostType('IMAGE');
              setIsExpanded(true);
            }}
          >
            <Image className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
            onClick={() => {
              setPostType('DOC');
              setIsExpanded(true);
            }}
          >
            <File className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Tạo bài viết</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsExpanded(false);
                setTitle('');
                setContent('');
                setError(null);
                clearAllFiles();
              }}
              className="h-9 w-9 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-5 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* Post Type Tabs */}
          <div className="flex gap-2 mb-5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setPostType('TEXT');
                clearAllFiles();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${postType === 'TEXT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <FileText className="w-4 h-4" />
              Post
            </button>
            <button
              onClick={() => {
                setPostType('IMAGE');
                clearAllFiles();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${postType === 'IMAGE'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Image className="w-4 h-4" />
              Ảnh
            </button>
            <button
              onClick={() => {
                setPostType('DOC');
                clearAllFiles();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${postType === 'DOC'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <File className="w-4 h-4" />
              Document
            </button>
          </div>

          {/* Community Selector */}
          <div className="mb-5">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-full border-slate-200 rounded-xl bg-slate-50 text-sm h-11 hover:bg-slate-100 transition-all">
                <SelectValue placeholder={loadingGroups ? 'Đang tải...' : 'Chọn cộng đồng'} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {groups && groups.length > 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.groupId} value={group.groupId} className="rounded-lg">
                      {group.groupName || group.name || 'Unnamed'}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-3 text-sm text-slate-500 text-center">
                    {loadingGroups ? 'Đang tải...' : 'Không có cộng đồng'}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Title Input */}
          <div className="mb-5">
            <Input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-slate-200 rounded-xl h-12 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              maxLength={300}
            />
            <div className="text-right text-xs text-slate-400 mt-1.5">{title.length}/300</div>
          </div>

          {/* Content based on post type */}
          {postType === 'TEXT' && (
            <Textarea
              placeholder="Nội dung (không bắt buộc)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] border-slate-200 resize-none rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 mb-5 transition-all"
            />
          )}

          {/* IMAGE Upload Section */}
          {postType === 'IMAGE' && (
            <div className="mb-5">
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-600">
                      Kéo thả hoặc{' '}
                      <span className="text-blue-600 font-semibold">chọn ảnh</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Có thể chọn nhiều ảnh cùng lúc
                    </p>
                  </div>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFilesSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-700">
                      Đã chọn {selectedFiles.length} ảnh
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFiles}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Xóa tất cả
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedFiles.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group"
                      >
                        {fileItem.preview && (
                          <img
                            src={fileItem.preview}
                            alt={fileItem.file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(fileItem.id)}
                            className="h-8 w-8 bg-white/90 hover:bg-white text-red-500 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                          {fileItem.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Textarea
                placeholder="Mô tả (không bắt buộc)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] border-slate-200 resize-none rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 mt-4 transition-all"
              />
            </div>
          )}

          {/* DOC Upload Section */}
          {postType === 'DOC' && (
            <div className="mb-5">
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                <label htmlFor="doc-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                      <File className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-sm text-slate-600">
                      Kéo thả hoặc{' '}
                      <span className="text-indigo-600 font-semibold">chọn tài liệu</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, DOC, DOCX, TXT, ZIP
                    </p>
                  </div>
                </label>
                <input
                  id="doc-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.zip"
                  multiple
                  onChange={(e) => handleFilesSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Document List Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">
                      Đã chọn {selectedFiles.length} tài liệu
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFiles}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Xóa tất cả
                    </Button>
                  </div>
                  {selectedFiles.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(fileItem.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileItem.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                placeholder="Mô tả (không bắt buộc)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] border-slate-200 resize-none rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 mt-4 transition-all"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                setTitle('');
                setContent('');
                setError(null);
                clearAllFiles();
              }}
              className="rounded-xl px-5 h-10 text-sm font-medium border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              className="rounded-xl px-6 h-10 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all"
              disabled={
                !title.trim() ||
                (postType === 'TEXT' && !content.trim()) ||
                (postType !== 'TEXT' && selectedFiles.length === 0) ||
                submitting ||
                uploading
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
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
      )}
    </div>
  );
}