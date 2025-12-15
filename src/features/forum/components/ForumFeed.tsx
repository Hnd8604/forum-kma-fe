import { useState, useMemo } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { Tabs, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import { usePostsStore } from '../../../store/useStore';

export default function ForumFeed() {
  const posts = usePostsStore((state) => state.posts);
  const toggleUpvote = usePostsStore((state) => state.toggleUpvote);
  const [sortBy, setSortBy] = useState('hot');

  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];
    
    switch (sortBy) {
      case 'new':
        return postsCopy.sort((a, b) => b.timestamp - a.timestamp);
      case 'top':
        return postsCopy.sort((a, b) => b.upvotes - a.upvotes);
      case 'hot':
      default:
        // Hot algorithm: score = upvotes / (hours_since_post + 2)^1.5
        return postsCopy.sort((a, b) => {
          const hoursA = (Date.now() - a.timestamp) / (1000 * 60 * 60);
          const hoursB = (Date.now() - b.timestamp) / (1000 * 60 * 60);
          const scoreA = a.upvotes / Math.pow(hoursA + 2, 1.5);
          const scoreB = b.upvotes / Math.pow(hoursB + 2, 1.5);
          return scoreB - scoreA;
        });
    }
  }, [posts, sortBy]);

  return (
    <main className="flex-1 max-w-3xl mx-auto p-6">
      {/* Sort Tabs */}
      <div className="mb-5">
        <Tabs defaultValue="hot" onValueChange={setSortBy}>
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
      <CreatePost />

      {/* Posts Feed */}
      <div className="space-y-5 mt-5">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Chưa có bài viết nào</p>
            <p className="text-sm mt-2">Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} onUpvote={toggleUpvote} />
          ))
        )}
      </div>
    </main>
  );
}