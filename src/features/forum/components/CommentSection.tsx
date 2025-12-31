import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { CommentService } from '../services/comment.service';
import type { Comment, ReactionType } from '../types/post.types';
import CommentItem from './CommentItem';
import { useAuthStore } from '../../../store/useStore';

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ postId, isOpen, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  // Debug: Log when component renders
  useEffect(() => {
    console.log('🔍 CommentSection rendered:', { postId, isOpen, commentsCount: comments.length });
  }, [postId, isOpen, comments.length]);

  const loadComments = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    console.log('📥 loadComments called:', { pageNum, append, isOpen, postId });
    if (!isOpen) return;

    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log('📡 Calling CommentService.getCommentsByPost...');
      const response = await CommentService.getCommentsByPost({
        postId,
        page: pageNum,
        size: 10,
      });
      console.log('✅ CommentService response:', response);

      // Backend now returns userReactionType directly, map to myReaction
      const commentsWithReactions = response.map((comment) => ({
        ...comment,
        myReaction: comment.myReaction || null,
      }));

      console.log('📦 Mapped comments:', commentsWithReactions.length, 'items');

      if (append) {
        setComments((prev) => {
          const newComments = [...prev, ...commentsWithReactions];
          return newComments;
        });
      } else {
        setComments(commentsWithReactions);
        // Notify parent of initial count
        if (pageNum === 0) {
          onCommentCountChange?.(commentsWithReactions.length);
        }
      }

      setHasMore(response.length === 10);
      setPage(pageNum);
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to load comments:', err);
      setError(err?.message || 'Không thể tải bình luận');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadComments(0, false);
    }
  }, [isOpen, loadComments]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadComments(page + 1, true);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const created = await CommentService.createComment({
        postId,
        content: newComment.trim(),
      });

      // Use current user info if backend doesn't return full author info
      const authorName = created.authorName && created.authorName !== created.authorId
        ? created.authorName
        : `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || created.authorId;

      const authorAvatarUrl = created.authorAvatarUrl || currentUser?.avatarUrl;

      setComments((prev) => {
        const newComments = [{
          ...created,
          authorName,
          authorAvatarUrl,
          myReaction: null
        }, ...prev];
        onCommentCountChange?.(newComments.length);
        return newComments;
      });
      setNewComment('');
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      setComments((prev) => {
        const newComments = prev.filter((c) => c.commentId !== commentId);
        onCommentCountChange?.(newComments.length);
        return newComments;
      });
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const updated = await CommentService.updateComment(commentId, { content });
      setComments((prev) =>
        prev.map((c) => (c.commentId === commentId ? { ...c, ...updated } : c))
      );
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleReactionChange = (commentId: string, newCount: number, myReaction: ReactionType | null) => {
    setComments((prev) =>
      prev.map((c) =>
        c.commentId === commentId
          ? { ...c, reactionCount: newCount, myReaction }
          : c
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-slate-100 bg-slate-50/50">
      {/* Comment Input */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.firstName || 'avatar'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {currentUser?.firstName?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg px-4 text-sm font-medium shadow-md shadow-blue-500/25 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1" />
                    Gửi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-slate-500">Đang tải bình luận...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Lỗi: {error}</p>
            <button
              onClick={() => loadComments(0, false)}
              className="mt-2 text-xs text-blue-500 hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Chưa có bình luận nào</p>
            <p className="text-xs">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.commentId}
                comment={comment}
                postId={postId}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
                onReactionChange={handleReactionChange}
              />
            ))}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  'Xem thêm bình luận'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
