import { useState, useEffect, useCallback } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { Tabs, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Button } from '../../../shared/components/ui/button';
import { Flame, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { PostService } from '../services/post.service';
import type { ApiPost } from '../types/post.types';

export default function ForumFeed() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('new');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const sort = sortBy === 'top' ? 'reactionCount,DESC' : 'createdAt,DESC';
      const response = await PostService.getFeed({ page: pageNum, limit: 10, sort });

      if (append) {
        setPosts((prev) => [...prev, ...response.content]);
      } else {
        setPosts(response.content);
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
  }, [sortBy]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, true);
    }
  };

  const handlePostCreated = () => {
    // Reload posts after creating a new one
    loadPosts(0, false);
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

  return (
    <main className="flex-1 max-w-3xl mx-auto p-6">
      {/* Sort Tabs */}
      <div className="mb-5">
        <Tabs defaultValue="new" value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <TabsList className="bg-white/80 backdrop-blur-sm border border-red-100 rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="hot" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg transition-all data-[state=active]:shadow-md"
            >
              <Flame className="w-4 h-4 mr-2" />
              Nổi bật
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg transition-all data-[state=active]:shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Mới nhất
            </TabsTrigger>
            <TabsTrigger 
              value="top" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg transition-all data-[state=active]:shadow-md"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Top
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Posts Feed */}
      <div className="space-y-5 mt-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => loadPosts(0, false)} variant="outline">
              Thử lại
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Chưa có bài viết nào</p>
            <p className="text-sm mt-2">Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onReactionChange={handleReactionChange}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="rounded-xl"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm'
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