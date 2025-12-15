import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { useAuthStore, usePostsStore } from '../../../store/useStore';
import PostCard from './PostCard';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const posts = usePostsStore((s) => s.posts);
  const toggleUpvote = usePostsStore((s) => s.toggleUpvote);

  if (!user) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-gray-600">Bạn chưa đăng nhập.</p>
        <Link to="/">
          <Button className="mt-4">Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.author.name === user.name);

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white text-2xl shadow-md">
            {user.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.group}</p>
            <p className="text-sm text-gray-400">student@university.edu</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/settings">
            <Button variant="outline">Chỉnh sửa</Button>
          </Link>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-medium mb-4">Bài viết của bạn</h3>
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="text-gray-600">Bạn chưa có bài viết nào.</div>
          ) : (
            userPosts.map((post) => (
              <PostCard key={post.id} post={post} onUpvote={() => toggleUpvote(post.id)} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
