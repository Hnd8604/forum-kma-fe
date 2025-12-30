import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { ApiPost, ReactionType } from '../types/post.types';
import { InteractionService } from '../services/interaction.service';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../../auth/services/auth.service';
import { GroupService } from '../../groups/services/group.service';
import { useAuthStore } from '../../../store/useStore';
import { formatTimeAgo } from '../../../shared/utils/date.utils';
import ReactionPicker from './ReactionPicker';
import PostDetailModal from './PostDetailModal';

interface PostCardProps {
  post: ApiPost;
  onReactionChange?: (postId: string, newCount: number, myReaction: string | null) => void;
}

export default function PostCard({ post, onReactionChange }: PostCardProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [authorName, setAuthorName] = useState<string>('');
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(null);
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

  useEffect(() => {
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
  }, [post.authorId]);

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
          onClick={() => setShowModal(true)}
        >
          {post.title}
        </h3>

        {/* Post Content */}
        <p
          className="text-sm text-slate-600 mb-3 whitespace-pre-line line-clamp-3 leading-relaxed cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => setShowModal(true)}
        >
          {post.content}
        </p>

        {/* Post Images Gallery */}
        {post.type === 'IMAGE' && post.resourceUrls && post.resourceUrls.length > 0 && (
          <div className="mb-3">
            {post.resourceUrls.length === 1 ? (
              // Single image - full width
              <div className="overflow-hidden rounded-xl">
                <img
                  src={post.resourceUrls[0]}
                  alt={post.title}
                  className="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => window.open(post.resourceUrls![0], '_blank')}
                />
              </div>
            ) : post.resourceUrls.length === 2 ? (
              // Two images - side by side
              <div className="grid grid-cols-2 gap-2">
                {post.resourceUrls.map((url, index) => (
                  <div key={index} className="overflow-hidden rounded-xl aspect-square">
                    <img
                      src={url}
                      alt={`${post.title} - ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            ) : post.resourceUrls.length === 3 ? (
              // Three images - first large, two small
              <div className="grid grid-cols-2 gap-2">
                <div className="row-span-2 overflow-hidden rounded-xl">
                  <img
                    src={post.resourceUrls[0]}
                    alt={`${post.title} - 1`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => window.open(post.resourceUrls![0], '_blank')}
                  />
                </div>
                {post.resourceUrls.slice(1).map((url, index) => (
                  <div key={index + 1} className="overflow-hidden rounded-xl aspect-square">
                    <img
                      src={url}
                      alt={`${post.title} - ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => window.open(url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Four or more images - 2x2 grid, show +N overlay on 4th if more
              <div className="grid grid-cols-2 gap-2">
                {post.resourceUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="overflow-hidden rounded-xl aspect-square relative">
                    <img
                      src={url}
                      alt={`${post.title} - ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
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
            {post.resourceUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Tài liệu đính kèm {post.resourceUrls!.length > 1 ? `(${index + 1}/${post.resourceUrls!.length})` : ''}
                </span>
              </a>
            ))}
          </div>
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
            onClick={() => setShowModal(true)}
            className="h-9 px-4 text-sm font-medium rounded-full transition-all text-slate-600 hover:bg-slate-100 hover:text-blue-600"
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
        onClose={() => setShowModal(false)}
        currentReaction={currentReaction}
        reactionCount={reactionCount}
        onReact={handleReaction}
        reacting={reacting}
      />
    </div>
  );
}