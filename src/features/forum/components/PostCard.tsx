import { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Angry,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { ApiPost, ReactionType } from '../types/post.types';
import { InteractionService } from '../services/interaction.service';
import { AuthService } from '../../auth/services/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover';

interface PostCardProps {
  post: ApiPost;
  onReactionChange?: (postId: string, newCount: number, myReaction: string | null) => void;
}

const reactionIcons: Record<ReactionType, { icon: React.ReactNode; color: string; bg: string }> = {
  LIKE: { icon: <ThumbsUp className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  LOVE: { icon: <Heart className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-50' },
  HAHA: { icon: <Laugh className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  WOW: { icon: <span className="text-sm">😮</span>, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  SAD: { icon: <Frown className="w-4 h-4" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ANGRY: { icon: <Angry className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50' },
};

export default function PostCard({ post, onReactionChange }: PostCardProps) {
  const [authorName, setAuthorName] = useState<string>('');
  const [reacting, setReacting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // Safe date formatting
  const getTimeAgo = () => {
    try {
      if (!post.createdAt) return 'Vừa xong';
      const date = new Date(post.createdAt);
      if (isNaN(date.getTime())) return 'Vừa xong';
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return 'Vừa xong';
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
        setAuthorName(post.authorId?.substring(0, 8) || 'Ẩn danh');
      }
    };
    loadAuthor();
  }, [post.authorId]);

  const handleReaction = async (type: ReactionType) => {
    if (reacting) return;
    setReacting(true);
    setShowReactions(false);

    try {
      await InteractionService.createOrUpdateInteraction({
        postId: post.postId,
        type,
      });

      // Toggle logic: if same reaction, it's removed
      const isToggle = post.myReaction === type;
      const newCount = isToggle ? post.reactionCount - 1 : post.reactionCount + (post.myReaction ? 0 : 1);
      const newReaction = isToggle ? null : type;

      onReactionChange?.(post.postId, newCount, newReaction);
    } catch (err) {
      console.error('Failed to react:', err);
    } finally {
      setReacting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const currentReaction = post.myReaction ? reactionIcons[post.myReaction] : null;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-red-100 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-2xl group">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-yellow-400 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
              <span className="text-white text-sm font-medium">{getInitials(authorName)}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="hover:underline cursor-pointer hover:text-red-600 transition-colors font-medium">
                  {authorName || 'Đang tải...'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{timeAgo}</span>
                {post.type !== 'TEXT' && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {post.type === 'IMAGE' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      {post.type === 'IMAGE' ? 'Hình ảnh' : 'Tài liệu'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-3">
        <h3 className="text-lg font-semibold mb-2 cursor-pointer hover:text-red-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image (if exists) */}
      {post.type === 'IMAGE' && post.resourceUrl && (
        <div className="px-5 pb-4">
          <img
            src={post.resourceUrl}
            alt={post.title}
            className="w-full max-h-96 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Post Document Link */}
      {post.type === 'DOC' && post.resourceUrl && (
        <div className="px-5 pb-4">
          <a
            href={post.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 hover:underline">Xem tài liệu đính kèm</span>
          </a>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-5 py-3 border-t border-red-50 bg-gradient-to-r from-gray-50/50 to-red-50/30 flex items-center justify-between">
        {/* Reaction Button with Popover */}
        <Popover open={showReactions} onOpenChange={setShowReactions}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={reacting}
              className={`${
                currentReaction
                  ? `${currentReaction.color} ${currentReaction.bg}`
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              } rounded-xl transition-all transform hover:scale-105`}
            >
              {currentReaction ? currentReaction.icon : <ThumbsUp className="w-5 h-5" />}
              <span className="ml-2">{post.reactionCount}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {(Object.keys(reactionIcons) as ReactionType[]).map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(type)}
                  className={`rounded-full p-2 hover:scale-125 transition-transform ${
                    post.myReaction === type ? reactionIcons[type].bg : ''
                  }`}
                >
                  {reactionIcons[type].icon}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Bình luận
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all transform hover:scale-105"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Chia sẻ
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 rounded-xl transition-all transform hover:scale-105"
        >
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}