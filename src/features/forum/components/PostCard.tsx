import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  MoreHorizontal,
  Trash,
  Loader2,
} from 'lucide-react';
import { ApiPost } from '@/interfaces/post.types';
import { CommentService } from '../services/comment.service';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PostService } from '../services/post.service';
import { useAuthStore } from '@/store/useStore';
import { formatTimeAgo } from '@/lib/date.utils';
import ReactionPicker from './ReactionPicker';
import PostDetailModal from './PostDetailModal';
import { useAuthorInfo, useGroupInfo, useReaction } from '../hooks';
import {
  PostHeader,
  PostImageGallery,
  PostDocuments,
  PostStats,
  PostCommentInput,
} from './post';

interface PostCardProps {
  post: ApiPost;
  onReactionChange?: (postId: string, newCount: number, myReaction: string | null) => void;
  onDelete?: (postId: string) => void;
  autoOpenIfId?: string;
}

export default function PostCard({ post, onReactionChange, onDelete, autoOpenIfId }: PostCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Custom hooks để fetch thông tin author và group
  const { authorName, authorAvatarUrl } = useAuthorInfo({
    authorId: post.authorId,
    initialName: post.authorName,
    initialAvatarUrl: post.authorAvatarUrl,
  });

  const { groupName } = useGroupInfo({
    groupId: post.groupId,
    initialGroupName: post.groupName,
  });

  // Custom hook để xử lý reactions
  const { currentReaction, reactionCount, isReacting, handleReaction } = useReaction({
    postId: post.postId,
    initialReaction: post.myReaction,
    initialCount: post.reactionCount,
    onReactionChange: (id, count, reaction) => {
      onReactionChange?.(id, count, reaction);
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle opening modal with URL change
  const openModal = useCallback(() => {
    setShowModal(true);
    navigate(`/forum/post/${post.postId}`, { replace: true });
  }, [post.postId, navigate]);

  // Handle closing modal with URL change
  const closeModal = useCallback(() => {
    setShowModal(false);
    navigate('/forum', { replace: true });
  }, [navigate]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
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

  // Auto-open modal if URL contains this post's ID
  useEffect(() => {
    if (autoOpenIfId === post.postId) {
      setShowModal(true);
    }
  }, [autoOpenIfId, post.postId]);

  // Check ownership
  const isOwner = currentUser?.userId === post.authorId;
  const canDelete = isOwner;

  // Sync comment count when post prop changes
  useEffect(() => {
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount, post.postId]);

  // Safe date formatting
  const timeAgo = formatTimeAgo(post.createdAt);

  const handleDeletePost = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await PostService.deletePost(post.postId);
      toast.success('Đã xóa bài viết');
      onDelete?.(post.postId);
    } catch (error) {
      toast.error('Không thể xóa bài viết');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    await CommentService.createComment({
      postId: post.postId,
      content,
    });
    setCommentCount(prev => prev + 1);
  };

  const getUserInitials = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
    }
    if (currentUser?.username) {
      return currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all duration-200 mb-4 hover:shadow-lg hover:shadow-slate-200/50 overflow-hidden">
      <div className="p-4">
        {/* Post Header */}
        <PostHeader
          authorId={post.authorId}
          authorName={authorName}
          authorAvatarUrl={authorAvatarUrl}
          groupId={post.groupId}
          groupName={groupName}
          timeAgo={timeAgo}
          postType={post.type}
        />

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
        {post.type === 'IMAGE' && (
          <PostImageGallery
            images={post.resourceUrls || []}
            title={post.title}
          />
        )}

        {/* Post Documents */}
        {post.type === 'DOC' && (
          <PostDocuments documents={post.resourceUrls || []} />
        )}

        {/* Post Stats */}
        <PostStats
          reactionCount={reactionCount}
          commentCount={commentCount}
          currentReaction={currentReaction}
          onCommentClick={openModal}
        />

        {/* Post Actions Buttons */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-1">
          <div className="flex-1">
            <ReactionPicker
              currentReaction={currentReaction}
              reactionCount={reactionCount}
              onReact={handleReaction}
              disabled={isReacting}
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
      <PostCommentInput
        userAvatarUrl={currentUser?.avatarUrl}
        userInitials={getUserInitials()}
        onSubmit={handleCommentSubmit}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        post={post}
        isOpen={showModal}
        onClose={closeModal}
        currentReaction={currentReaction}
        reactionCount={reactionCount}
        onReact={handleReaction}
        reacting={isReacting}
      />

      {/* Delete Confirmation Dialog */}
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