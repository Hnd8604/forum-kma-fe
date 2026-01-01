import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Smile,
  Send,
  Trash,
  Loader2,
  ThumbsUp,
} from 'lucide-react';
import { ApiPost, ReactionType } from '../types/post.types';
import { InteractionService } from '../services/interaction.service';
import { CommentService } from '../services/comment.service';
import { toast } from 'sonner';
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
import { PostService } from '../services/post.service';
import { AuthService } from '../../auth/services/auth.service';
import { GroupService } from '../../groups/services/group.service';
import { useAuthStore } from '../../../store/useStore';
import { formatTimeAgo } from '../../../shared/utils/date.utils';
import ReactionPicker, { REACTIONS } from './ReactionPicker';
import PostDetailModal from './PostDetailModal';

interface PostCardProps {
  post: ApiPost;
  onReactionChange?: (postId: string, newCount: number, myReaction: string | null) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onReactionChange, onDelete }: PostCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  // Use author info from backend if available, otherwise fetch
  const [authorName, setAuthorName] = useState<string>(post.authorName || '');
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(post.authorAvatarUrl || null);
  const [groupName, setGroupName] = useState<string>(post.groupName || '');
  const [reacting, setReacting] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(
    post.myReaction || null
  );
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [showModal, setShowModal] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();

  // Handle opening modal with URL change
  const openModal = useCallback(() => {
    setShowModal(true);
    // Update URL to post detail path
    window.history.pushState({ postId: post.postId }, '', `/forum/post/${post.postId}`);
  }, [post.postId]);

  // Handle closing modal with URL change
  const closeModal = useCallback(() => {
    setShowModal(false);
    // Restore URL to forum page
    window.history.pushState({}, '', '/forum');
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we're navigating away from this post's modal
      if (!window.location.pathname.includes(`/forum/post/${post.postId}`)) {
        setShowModal(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [post.postId]);

  // Listen for open-post-modal event (from search)
  useEffect(() => {
    const handleOpenPostModal = (event: CustomEvent) => {
      if (event.detail?.postId === post.postId) {
        setShowModal(true);
      }
    };

    window.addEventListener('open-post-modal', handleOpenPostModal as EventListener);
    return () => window.removeEventListener('open-post-modal', handleOpenPostModal as EventListener);
  }, [post.postId]);

  // Check ownership
  // Check ownership
  const isOwner = currentUser?.userId === post.authorId;
  const canDelete = isOwner;


  // Debug: Log post data
  useEffect(() => {
    console.log(`PostCard ${post.postId}:`, {
      type: post.type,
      resourceUrls: post.resourceUrls,
      commentCount: post.commentCount,
      reactionCount: post.reactionCount
    });
  }, [post.postId, post.type, post.resourceUrls, post.commentCount, post.reactionCount]);

  // Sync comment count when post prop changes
  useEffect(() => {
    console.log(`Syncing commentCount for ${post.postId}: ${post.commentCount}`);
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount, post.postId]);

  // Safe date formatting
  const getTimeAgo = () => formatTimeAgo(post.createdAt);

  const timeAgo = getTimeAgo();

  // Only fetch author info if not provided by backend
  useEffect(() => {
    // If backend already provided author info, use it directly
    if (post.authorName) {
      setAuthorName(post.authorName);
      setAuthorAvatarUrl(post.authorAvatarUrl || null);
      return;
    }

    // Fallback: fetch from AuthService (for backward compatibility)
    const loadAuthor = async () => {
      try {
        const user = await AuthService.getUserById(post.authorId);
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || post.authorId;
        setAuthorName(name);
        setAuthorAvatarUrl(user.avatarUrl || null);
      } catch {
        setAuthorName(post.authorId?.substring(0, 8) || 'anonymous');
        setAuthorAvatarUrl(null);
      }
    };
    loadAuthor();
  }, [post.authorId, post.authorName, post.authorAvatarUrl]);

  // Load group name if not provided
  useEffect(() => {
    if (!post.groupName && post.groupId) {
      const loadGroup = async () => {
        try {
          const group = await GroupService.getGroupById(post.groupId);
          setGroupName(group.groupName || '');
        } catch {
          setGroupName('');
        }
      };
      loadGroup();
    } else if (post.groupName) {
      setGroupName(post.groupName);
    }
  }, [post.groupId, post.groupName]);

  // Sync reaction state when post prop changes
  useEffect(() => {
    setCurrentReaction(post.myReaction || null);
    setReactionCount(post.reactionCount);
  }, [post.myReaction, post.reactionCount]);

  const handleReaction = async (type: ReactionType) => {
    if (reacting) return;
    setReacting(true);

    try {
      await InteractionService.createOrUpdateInteraction({
        postId: post.postId,
        type,
      });

      const isToggle = currentReaction === type;

      let newCount = reactionCount;
      if (isToggle) {
        // Removing reaction
        newCount = reactionCount - 1;
        setCurrentReaction(null);
        setReactionCount(newCount);
        onReactionChange?.(post.postId, newCount, null);
      } else {
        // Adding or changing reaction
        if (currentReaction === null) {
          newCount = reactionCount + 1;
        }
        // If changing reaction type, count stays the same
        setCurrentReaction(type);
        setReactionCount(newCount);
        onReactionChange?.(post.postId, newCount, type);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    } finally {
      setReacting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await PostService.deletePost(post.postId);
      toast.success('Đã xóa bài viết');
      onDelete?.(post.postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Không thể xóa bài viết');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  const getInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.username) {
      return currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || sendingComment) return;

    setSendingComment(true);
    try {
      await CommentService.createComment({
        postId: post.postId,
        content: commentText.trim(),
      });

      setCommentText('');
      setCommentCount(prev => prev + 1);
      // Optionally show success feedback
    } catch (err) {
      console.error('Failed to send comment:', err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all duration-200 mb-4 hover:shadow-lg hover:shadow-slate-200/50 overflow-hidden">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <Link to={`/profile/${post.authorId}`} className="flex items-center group">
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={authorName || 'avatar'}
                className="w-8 h-8 rounded-full object-cover mr-2.5 shadow-md group-hover:ring-2 group-hover:ring-blue-300 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2.5 shadow-md shadow-blue-500/20 group-hover:ring-2 group-hover:ring-blue-300 transition-all">
                <span className="text-white text-xs font-bold">
                  {authorName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {authorName || 'loading...'}
                </span>
                {groupName && (
                  <>
                    <span className="text-slate-400">•</span>
                    <Link
                      to={`/forum/group/${post.groupId}`}
                      className="text-slate-600 hover:text-blue-600 hover:underline transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {groupName}
                    </Link>
                  </>
                )}
              </div>
              <span className="text-xs text-slate-400">{timeAgo}</span>
            </div>
          </Link>
          {post.type !== 'TEXT' && (
            <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
              {post.type === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {post.type === 'IMAGE' ? 'Hình ảnh' : 'Tài liệu'}
            </span>
          )}
        </div>

        {/* Post Title */}
        <h3
          className="text-lg font-semibold text-slate-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug"
          onClick={openModal}
        >
          {post.title}
        </h3>

        {/* Post Content */}
        <p
          className="text-sm text-slate-600 mb-3 whitespace-pre-line line-clamp-3 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors"
          onClick={openModal}
        >
          {post.content}
        </p>

        {/* Post Images Gallery */}
        {post.type === 'IMAGE' && post.resourceUrls && post.resourceUrls.length > 0 && (
          <div className="mb-3">
            {post.resourceUrls.length === 1 ? (
              // Single image - full width
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={post.resourceUrls[0]}
                  alt={post.title}
                  className="w-full object-cover max-h-[500px] cursor-pointer"
                  onClick={() => window.open(post.resourceUrls![0], '_blank')}
                />
              </div>
            ) : post.resourceUrls.length === 2 ? (
              // Two images - side by side
              <div className="grid grid-cols-2 gap-2">
                {post.resourceUrls.map((url, index) => (
                  <div key={index} className="overflow-hidden rounded-xl aspect-square border border-slate-200">
                    <img
                      src={url}
                      alt={`${post.title} - ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            ) : post.resourceUrls.length === 3 ? (
              // Three images - first large, two small
              <div className="grid grid-cols-2 gap-2">
                <div className="row-span-2 overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={post.resourceUrls[0]}
                    alt={`${post.title} - 1`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(post.resourceUrls![0], '_blank')}
                  />
                </div>
                {post.resourceUrls.slice(1).map((url, index) => (
                  <div key={index + 1} className="overflow-hidden rounded-xl aspect-square border border-slate-200">
                    <img
                      src={url}
                      alt={`${post.title} - ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Four or more images - 2x2 grid, show +N overlay on 4th if more
              <div className="grid grid-cols-2 gap-2">
                {post.resourceUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="overflow-hidden rounded-xl aspect-square relative border border-slate-200">
                    <img
                      src={url}
                      alt={`${post.title} - ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                    {index === 3 && post.resourceUrls!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                        <span className="text-white text-3xl font-bold">
                          +{post.resourceUrls!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Document Links */}
        {post.type === 'DOC' && post.resourceUrls && post.resourceUrls.length > 0 && (
          <div className="mb-3 space-y-2">
            {post.resourceUrls.map((url, index) => {
              // Extract filename from URL
              const getFileName = (fileUrl: string) => {
                try {
                  const urlObj = new URL(fileUrl);
                  const pathname = urlObj.pathname;
                  const filename = pathname.split('/').pop();
                  return filename ? decodeURIComponent(filename) : `Tài liệu đính kèm ${index + 1}`;
                } catch {
                  return `Tài liệu đính kèm ${index + 1}`;
                }
              };

              const fileName = getFileName(url);
              const fileExt = fileName.split('.').pop()?.toUpperCase() || 'FILE';

              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                      {fileName}
                    </p>
                    <p className="text-xs text-slate-400">{fileExt}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </a>
              );
            })}
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-slate-500 py-2 border-t border-slate-100 mt-2">
          {reactionCount > 0 && (
            <div className="flex items-center gap-1">
              {currentReaction ? (
                <>
                  <div className="text-lg">
                    {REACTIONS.find((r) => r.type === currentReaction)?.emoji || '👍'}
                  </div>
                  {reactionCount > 1 && (
                    <span className="hover:underline cursor-pointer">Bạn và {reactionCount - 1} người khác</span>
                  )}
                  {reactionCount === 1 && (
                    <span className="hover:underline cursor-pointer">Bạn</span>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-blue-500 rounded-full p-1">
                    <ThumbsUp className="w-3 h-3 text-white fill-white" />
                  </div>
                  <span className="hover:underline cursor-pointer">{reactionCount}</span>
                </>
              )}
            </div>
          )}
          {!reactionCount && <div />} {/* Spacer if no likes */}

          {commentCount > 0 && (
            <div
              className="hover:underline cursor-pointer"
              onClick={openModal}
            >
              {commentCount} bình luận
            </div>
          )}
        </div>

        {/* Post Actions Buttons */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-1">
          <div className="flex-1">
            <ReactionPicker
              currentReaction={currentReaction}
              reactionCount={reactionCount}
              onReact={handleReaction}
              disabled={reacting}
              size="md"
              showCount={false}
              className="w-full justify-center hover:bg-slate-50 rounded-lg py-2"
            />
          </div>

          <Button
            variant="ghost"
            className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-50 rounded-lg text-slate-600 font-medium h-10 transition-colors"
            onClick={openModal}
          >
            <MessageSquare className="w-5 h-5" />
            Bình luận
          </Button>

          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-slate-500 hover:bg-slate-50 rounded-full ml-1 transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900">
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Xóa bài viết
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Comment Input Bar */}
      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.username || 'User'} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-slate-200 hover:border-slate-300 focus-within:border-blue-400 transition-colors">
            <input
              type="text"
              placeholder="Tham gia thảo luận..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendingComment}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
            />
            <button
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              type="button"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim() || sendingComment}
              className="text-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors p-1"
              type="button"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={post}
        isOpen={showModal}
        onClose={closeModal}
        currentReaction={currentReaction}
        reactionCount={reactionCount}
        onReact={handleReaction}
        reacting={reacting}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                handleDeletePost();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa bài viết'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}