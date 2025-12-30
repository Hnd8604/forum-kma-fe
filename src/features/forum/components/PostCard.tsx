import { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/ui/button';
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { ApiPost, ReactionType } from '../types/post.types';
import { InteractionService } from '../services/interaction.service';
import { AuthService } from '../../auth/services/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactionPicker from './ReactionPicker';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: ApiPost;
  onReactionChange?: (postId: string, newCount: number, myReaction: string | null) => void;
}

export default function PostCard({ post, onReactionChange }: PostCardProps) {
  const [authorName, setAuthorName] = useState<string>('');
  const [reacting, setReacting] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(
    post.myReaction || null
  );
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  // Debug: Log post data
  useEffect(() => {
    console.log(`PostCard ${post.postId}: commentCount=${post.commentCount}, reactionCount=${post.reactionCount}`);
  }, [post.postId, post.commentCount, post.reactionCount]);

  // Sync comment count when post prop changes
  useEffect(() => {
    console.log(`Syncing commentCount for ${post.postId}: ${post.commentCount}`);
    setCommentCount(post.commentCount || 0);
  }, [post.commentCount, post.postId]);

  // Safe date formatting
  const getTimeAgo = () => {
    try {
      if (!post.createdAt) return 'vừa xong';
      const date = new Date(post.createdAt);
      if (isNaN(date.getTime())) return 'vừa xong';
      return formatDistanceToNow(date, {
        addSuffix: false,
        locale: vi,
      });
    } catch {
      return 'vừa xong';
    }
  };

  const timeAgo = getTimeAgo();

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const user = await AuthService.getUserById(post.authorId);
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || post.authorId;
        setAuthorName(name);
      } catch {
        setAuthorName(post.authorId?.substring(0, 8) || 'anonymous');
      }
    };
    loadAuthor();
  }, [post.authorId]);

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

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all duration-200 mb-4 hover:shadow-lg hover:shadow-slate-200/50 overflow-hidden">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2.5 shadow-md shadow-blue-500/20">
            <span className="text-white text-xs font-bold">
              {authorName?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors">
              {authorName || 'loading...'}
            </span>
            <span className="text-xs text-slate-400">{timeAgo}</span>
          </div>
          {post.type !== 'TEXT' && (
            <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
              {post.type === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {post.type === 'IMAGE' ? 'Hình ảnh' : 'Tài liệu'}
            </span>
          )}
        </div>

        {/* Post Title */}
        <h3 className="text-lg font-semibold text-slate-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors leading-snug">
          {post.title}
        </h3>

        {/* Post Content */}
        <p className="text-sm text-slate-600 mb-3 whitespace-pre-line line-clamp-3 leading-relaxed">
          {post.content}
        </p>

        {/* Post Image */}
        {post.type === 'IMAGE' && post.resourceUrl && (
          <div className="mb-3 overflow-hidden rounded-xl">
            <img
              src={post.resourceUrl}
              alt={post.title}
              className="w-full object-cover max-h-[400px] hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Post Document Link */}
        {post.type === 'DOC' && post.resourceUrl && (
          <a
            href={post.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-3 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">Xem tài liệu đính kèm</span>
          </a>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          {/* Reaction Picker */}
          <ReactionPicker
            currentReaction={currentReaction}
            reactionCount={reactionCount}
            onReact={handleReaction}
            disabled={reacting}
            size="md"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className={`h-9 px-4 text-sm font-medium rounded-full transition-all ${
              showComments 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {commentCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-amber-600 rounded-full transition-all"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Lưu
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full ml-auto transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection
        postId={post.postId}
        isOpen={showComments}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  );
}