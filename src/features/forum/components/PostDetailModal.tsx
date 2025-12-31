import { useState, useEffect } from 'react';
import { X, MessageCircle, ChevronLeft, ChevronRight, FileText, ExternalLink, ThumbsUp } from 'lucide-react';
import { ApiPost, ReactionType } from '../types/post.types';
import { AuthService } from '../../auth/services/auth.service';
import { GroupService } from '../../groups/services/group.service';
import { CommentService } from '../services/comment.service';
import { formatTimeAgo } from '../../../shared/utils/date.utils';
import ReactionPicker, { REACTIONS } from './ReactionPicker';
import CommentSection from './CommentSection';

interface PostDetailModalProps {
  post: ApiPost;
  isOpen: boolean;
  onClose: () => void;
  currentReaction: ReactionType | null;
  reactionCount: number;
  onReact: (type: ReactionType) => void;
  reacting: boolean;
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  currentReaction,
  reactionCount,
  onReact,
  reacting,
}: PostDetailModalProps) {
  // Use author info from backend if available
  const [authorName, setAuthorName] = useState<string>(post.authorName || '');
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(post.authorAvatarUrl || null);
  const [groupName, setGroupName] = useState<string>(post.groupName || '');
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const getTimeAgo = () => formatTimeAgo(post.createdAt);

  // Only fetch author info if not provided by backend
  useEffect(() => {
    // If backend already provided author info, use it directly
    if (post.authorName) {
      setAuthorName(post.authorName);
      setAuthorAvatarUrl(post.authorAvatarUrl || null);
      return;
    }

    // Fallback: fetch from AuthService
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

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageExpanded(true);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.resourceUrls && currentImageIndex < post.resourceUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-[1200px] max-w-[95vw] max-h-[90vh] flex flex-col pointer-events-auto transform transition-all duration-300 animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Gradient */}
          <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200 flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-3">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt={authorName || 'avatar'}
                  className="w-12 h-12 rounded-full object-cover shadow-lg ring-4 ring-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-white">
                  <span className="text-white text-lg font-bold">
                    {authorName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-slate-900">{authorName}</h2>
                  {groupName && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-base font-medium text-slate-600">{groupName}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-slate-600">{getTimeAgo()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 group"
            >
              <X className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Images if available */}
            {post.type === 'IMAGE' && post.resourceUrls && post.resourceUrls.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 relative">
                {post.resourceUrls.length === 1 ? (
                  <div className="relative group">
                    <img
                      src={post.resourceUrls[0]}
                      alt={post.title}
                      className="w-full max-h-[600px] object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                      onClick={() => handleImageClick(0)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className={`grid ${post.resourceUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-1 p-1`}>
                    {post.resourceUrls.slice(0, 4).map((url, index) => (
                      <div
                        key={index}
                        className={`relative group overflow-hidden rounded-lg ${post.resourceUrls!.length === 3 && index === 0 ? 'col-span-2' : ''
                          }`}
                        style={{
                          aspectRatio: post.resourceUrls!.length === 3 && index === 0 ? '16/9' : '1/1'
                        }}
                      >
                        <img
                          src={url}
                          alt={`${post.title} - ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:scale-110"
                          onClick={() => handleImageClick(index)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {index === 3 && post.resourceUrls!.length > 4 && (
                          <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/80 transition-all duration-300"
                            onClick={() => handleImageClick(index)}
                          >
                            <span className="text-white text-4xl font-bold drop-shadow-lg">
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

            {/* Post Info */}
            <div className="px-6 py-5">
              {/* Title if exists */}
              {post.title && (
                <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
                  {post.title}
                </h3>
              )}

              {/* Content */}
              <p className="text-slate-700 text-base leading-relaxed mb-5 whitespace-pre-line">
                {post.content}
              </p>

              {/* Post Document Links */}
              {post.type === 'DOC' && post.resourceUrls && post.resourceUrls.length > 0 && (
                <div className="mb-5 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Tài liệu đính kèm ({post.resourceUrls.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
              )}

              {/* Stats - Separated Layout */}
              <div className="border-t border-slate-200 pt-3 pb-2">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  {/* Likes Section */}
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

                  {/* Comments Section */}
                  {commentCount > 0 && (
                    <div className="hover:underline cursor-pointer">
                      {commentCount} bình luận
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Separated with border */}
              <div className="border-t border-slate-200 pt-2 pb-1">
                <div className="flex items-center gap-1">
                  {/* Reaction Button */}
                  <div className="flex-1">
                    <ReactionPicker
                      currentReaction={currentReaction}
                      reactionCount={reactionCount}
                      onReact={onReact}
                      disabled={reacting}
                      size="md"
                      showCount={false}
                      className="w-full justify-center hover:bg-slate-50 rounded-lg py-2"
                    />
                  </div>

                  {/* Comment Button */}
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-all duration-200 group h-10"
                    onClick={() => {
                      // Focus on comment input if possible, or just scroll to it
                      // Since CommentSection is already there, maybe just scroll
                    }}
                  >
                    <MessageCircle className="w-5 h-5 text-slate-500 group-hover:text-slate-600 transition-colors" />
                    <span className="group-hover:text-slate-600 transition-colors">Bình luận</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <CommentSection
              postId={post.postId}
              isOpen={true}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>
        </div >
      </div >

      {/* Image Lightbox */}
      {
        isImageExpanded && post.resourceUrls && (
          <div
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsImageExpanded(false)}
          >
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-md"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={post.resourceUrls[currentImageIndex]}
                alt={`${post.title} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              {post.resourceUrls.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                  )}

                  {currentImageIndex < post.resourceUrls.length - 1 && (
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  )}

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium">
                    {currentImageIndex + 1} / {post.resourceUrls.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }
    </>
  );
}
