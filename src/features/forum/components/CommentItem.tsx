import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { MoreHorizontal, Edit2, Trash2, Check, X, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Comment, ReactionType } from '../types/post.types';
import ReactionPicker from './ReactionPicker';
import { InteractionService } from '../services/interaction.service';
import { CommentService } from '../services/comment.service';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onDelete: (commentId: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onReactionChange: (commentId: string, newCount: number, myReaction: ReactionType | null) => void;
  onReply?: (parentCommentId: string, content: string) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  postId,
  onDelete,
  onUpdate,
  onReactionChange,
  onReply,
  depth = 0,
}: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [reacting, setReacting] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const getTimeAgo = () => {
    try {
      if (!comment.createdAt) return 'vừa xong';
      const date = new Date(comment.createdAt);
      if (isNaN(date.getTime())) return 'vừa xong';
      return formatDistanceToNow(date, { addSuffix: false, locale: vi });
    } catch {
      return 'vừa xong';
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onUpdate(comment.commentId, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleReaction = async (type: ReactionType) => {
    if (reacting) return;
    setReacting(true);

    try {
      await InteractionService.createOrUpdateInteraction({
        postId,
        commentId: comment.commentId,
        type,
      });

      // Toggle logic
      const isToggle = comment.myReaction === type;
      if (isToggle) {
        onReactionChange(comment.commentId, Math.max(0, comment.reactionCount - 1), null);
      } else {
        const newCount = comment.myReaction
          ? comment.reactionCount // switching reaction type
          : comment.reactionCount + 1; // new reaction
        onReactionChange(comment.commentId, newCount, type);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    } finally {
      setReacting(false);
    }
  };

  const handleLoadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    try {
      const fetchedReplies = await CommentService.getRepliesByCommentId(comment.commentId);
      setReplies(fetchedReplies);
      setShowReplies(true);
    } catch (err) {
      console.error('Failed to load replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const newReply = await CommentService.createComment({
        postId,
        content: replyContent.trim(),
        parentCommentId: comment.commentId,
      });
      setReplies((prev) => [...prev, { ...newReply, myReaction: null }]);
      setReplyContent('');
      setShowReplyInput(false);
      if (!showReplies) setShowReplies(true);
      onReply?.(comment.commentId, replyContent.trim());
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.commentId !== replyId));
  };

  const handleUpdateReply = (replyId: string, content: string) => {
    setReplies((prev) =>
      prev.map((r) => (r.commentId === replyId ? { ...r, content } : r))
    );
  };

  const handleReplyReactionChange = (replyId: string, newCount: number, myReaction: ReactionType | null) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.commentId === replyId
          ? { ...r, reactionCount: newCount, myReaction }
          : r
      )
    );
  };

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">
          {comment.authorName?.[0]?.toUpperCase() || 'U'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">
                {comment.authorName || comment.authorId?.substring(0, 8) || 'Ẩn danh'}
              </span>
              <span className="text-xs text-slate-400">{getTimeAgo()}</span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="text-xs text-slate-400">(đã chỉnh sửa)</span>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 min-w-[120px]">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        onDelete(comment.commentId);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7 px-2 text-slate-500"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Lưu
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 whitespace-pre-line">{comment.content}</p>
          )}
        </div>

        {/* Reaction Area */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-1.5 px-2">
            <ReactionPicker
              currentReaction={comment.myReaction}
              reactionCount={comment.reactionCount}
              onReact={handleReaction}
              disabled={reacting}
              size="sm"
            />
            
            {/* Reply Button */}
            {depth < 2 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Trả lời
              </button>
            )}

            {/* Show Replies Button */}
            {comment.replyCount > 0 && (
              <button
                onClick={handleLoadReplies}
                disabled={loadingReplies}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Ẩn {comment.replyCount} câu trả lời
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    {loadingReplies ? 'Đang tải...' : `Xem ${comment.replyCount} câu trả lời`}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Reply Input */}
        {showReplyInput && depth < 2 && (
          <div className="mt-3 ml-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết câu trả lời..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReply();
                    }
                  }}
                />
                <div className="flex justify-end gap-2 mt-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReplyInput(false);
                      setReplyContent('');
                    }}
                    className="h-7 px-2 text-xs text-slate-500"
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={!replyContent.trim() || submittingReply}
                    className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                  >
                    {submittingReply ? 'Đang gửi...' : 'Gửi'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies List */}
        {showReplies && replies.length > 0 && (
          <div className="mt-3 ml-2 space-y-3 border-l-2 border-slate-100 pl-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.commentId}
                comment={reply}
                postId={postId}
                onDelete={handleDeleteReply}
                onUpdate={handleUpdateReply}
                onReactionChange={handleReplyReactionChange}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
