import { useState, useEffect } from 'react';
import { Button } from '../../../shared/components/ui/button';
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  ArrowBigUp,
  ArrowBigDown,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { ApiPost, ReactionType } from '../types/post.types';
import { InteractionService } from '../services/interaction.service';
import { AuthService } from '../../auth/services/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PostCardProps {
  post: ApiPost;
  onReactionChange?: (postId: string, newCount: number, myReaction: string | null) => void;
}

export default function PostCard({ post, onReactionChange }: PostCardProps) {
  const [authorName, setAuthorName] = useState<string>('');
  const [reacting, setReacting] = useState(false);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(
    post.myReaction === 'LIKE' ? 'up' : post.myReaction === 'ANGRY' ? 'down' : null
  );

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

  const handleVote = async (direction: 'up' | 'down') => {
    if (reacting) return;
    setReacting(true);

    const type: ReactionType = direction === 'up' ? 'LIKE' : 'ANGRY';

    try {
      await InteractionService.createOrUpdateInteraction({
        postId: post.postId,
        type,
      });

      const isToggle = (direction === 'up' && voteState === 'up') || (direction === 'down' && voteState === 'down');
      
      let newCount = post.reactionCount;
      if (isToggle) {
        // Removing vote
        newCount = direction === 'up' ? post.reactionCount - 1 : post.reactionCount + 1;
        setVoteState(null);
        onReactionChange?.(post.postId, newCount, null);
      } else {
        // Adding/changing vote
        if (voteState === null) {
          newCount = direction === 'up' ? post.reactionCount + 1 : post.reactionCount - 1;
        } else {
          newCount = direction === 'up' ? post.reactionCount + 2 : post.reactionCount - 2;
        }
        setVoteState(direction);
        onReactionChange?.(post.postId, newCount, type);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
    } finally {
      setReacting(false);
    }
  };

  const formatVoteCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
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
          {/* Vote buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5">
            <button
              onClick={() => handleVote('up')}
              disabled={reacting}
              className={`p-2 rounded-full transition-all duration-200 ${voteState === 'up' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <ArrowBigUp className={`w-4 h-4 ${voteState === 'up' ? 'fill-white' : ''}`} />
            </button>
            <span className={`text-sm font-bold min-w-[28px] text-center ${
              voteState === 'up' ? 'text-blue-600' : 
              voteState === 'down' ? 'text-red-500' : 
              'text-slate-700'
            }`}>
              {formatVoteCount(post.reactionCount)}
            </span>
            <button
              onClick={() => handleVote('down')}
              disabled={reacting}
              className={`p-2 rounded-full transition-all duration-200 ${voteState === 'down' ? 'bg-red-500 text-white shadow-md shadow-red-500/30' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <ArrowBigDown className={`w-4 h-4 ${voteState === 'down' ? 'fill-white' : ''}`} />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-all"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {post.commentCount || 0}
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
    </div>
  );
}