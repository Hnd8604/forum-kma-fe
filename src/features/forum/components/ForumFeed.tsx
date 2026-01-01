import { useState, useEffect, useCallback } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { Button } from '../../../shared/components/ui/button';
import { Flame, Zap, Loader2, LayoutGrid } from 'lucide-react';
import { PostService } from '../services/post.service';
import type { ApiPost } from '../types/post.types';

import { useAuthStore } from '../../../store/useStore';

export default function ForumFeed() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'all' | 'popular' | 'new'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const user = useAuthStore((state) => state.user);

  const loadPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      let sortParam: 'createdAt,DESC' | 'reactionCount,DESC' = 'createdAt,DESC';
      if (sortBy === 'popular') sortParam = 'reactionCount,DESC';
      // 'new' and 'all' use createdAt,DESC

      const response = await PostService.getFeed({
        page: pageNum,
        limit: 10,
        sort: sortParam
      });

      // Sort posts on client side to ensure correct order
      let sortedPosts = [...response.content];
      if (sortBy === 'new' || sortBy === 'all') {
        // Sort by createdAt descending (newest first)
        sortedPosts.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending: newer posts first
        });
      } else if (sortBy === 'popular') {
        // Sort by reaction count (likes) only - descending
        sortedPosts.sort((a, b) => (b.reactionCount || 0) - (a.reactionCount || 0));
      }

      if (append) {
        setPosts((prev) => [...prev, ...sortedPosts]);
      } else {
        setPosts(sortedPosts);
      }

      setHasMore(pageNum < response.totalPages - 1);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setError(err.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadPosts(0, false);

    // Listen for sort filter changes from sidebar
    const handleSortFilterChange = (event: CustomEvent) => {
      const newSort = event.detail as 'all' | 'popular' | 'new';
      setSortBy(newSort);
    };

    window.addEventListener('changeSortFilter', handleSortFilterChange as EventListener);

    return () => {
      window.removeEventListener('changeSortFilter', handleSortFilterChange as EventListener);
    };
  }, [sortBy, loadPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, true);
    }
  };

  const handlePostCreated = (newPost?: ApiPost) => {
    if (newPost) {
      // Format the new post to match feed structure and include user details
      const formattedPost: ApiPost = {
        ...newPost,
        authorName: user?.username || newPost.authorName || 'Người dùng', // fallback
        authorAvatarUrl: user?.avatarUrl, // Use current user avatar
        // Construct display name if available
        ...(user?.firstName && user?.lastName ? {
          authorName: `${user.firstName} ${user.lastName}`
        } : {}),
        reactionCount: 0,
        commentCount: 0,
        myReaction: null,
      };

      // Prepend to posts list instantly
      setPosts((prev) => [formattedPost, ...prev]);

      // Optional: Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      loadPosts(0, false);
    }
  };

  const handleReactionChange = (postId: string, newReactionCount: number, myReaction: string | null) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.postId === postId
          ? { ...post, reactionCount: newReactionCount, myReaction: myReaction as any }
          : post
      )
    );
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.postId !== postId));
  };

  const sortOptions = [
    { id: 'all', label: 'Tất cả', icon: LayoutGrid },
    { id: 'popular', label: 'Phổ biến', icon: Flame },
    { id: 'new', label: 'Mới', icon: Zap },
  ];

  return (
    <main className="flex-1 min-w-0">
      {/* Create Post Box - Reddit style */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Sort Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 mb-5 p-2 flex items-center shadow-sm">
        <div className="flex items-center gap-1 w-full">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
            <span className="text-sm text-slate-500">Đang tải bài viết...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <p className="text-red-500 mb-4 text-sm">{error}</p>
            <Button
              onClick={() => loadPosts(0, false)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl px-6 text-sm font-medium shadow-lg shadow-blue-500/25"
            >
              Thử lại
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">Chưa có bài viết nào</p>
            <p className="text-sm mt-1 text-slate-500">Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onReactionChange={handleReactionChange}
                onDelete={handlePostDelete}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center py-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl px-8 text-sm font-medium h-11 shadow-lg shadow-blue-500/25 transition-all"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm bài viết'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}