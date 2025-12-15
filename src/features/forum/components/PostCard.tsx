import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '../types/post.types';
import { useRelativeTime } from '../../../shared/hooks/useTime';

interface PostCardProps {
  post: Post;
  onUpvote: (postId: number) => void;
}

export default function PostCard({ post, onUpvote }: PostCardProps) {
  const timeAgo = useRelativeTime(post.timestamp);
  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-red-100 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-2xl group">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-yellow-400 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
              <span className="text-white">{post.author.avatar}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="hover:underline cursor-pointer hover:text-red-600 transition-colors">{post.author.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="hover:underline cursor-pointer hover:text-red-600 transition-colors">g/{post.author.group}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-5 pb-3">
        <h3 className="mb-2 cursor-pointer hover:text-red-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image (if exists) */}
      {post.image && (
        <div className="px-5 pb-4">
          <div className="w-full h-72 bg-gradient-to-br from-red-100 via-yellow-50 to-orange-50 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
            <span className="text-6xl">📷</span>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-5 py-3 border-t border-red-50 bg-gradient-to-r from-gray-50/50 to-red-50/30 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`${
              post.hasUpvoted 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
            } rounded-xl transition-all transform hover:scale-105`}
            onClick={() => onUpvote(post.id)}
          >
            <ArrowBigUp className={`w-5 h-5 mr-1 transition-all ${post.hasUpvoted ? 'fill-red-600' : ''}`} />
            {post.upvotes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all transform hover:scale-105"
          >
            <ArrowBigDown className="w-5 h-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {post.comments}
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