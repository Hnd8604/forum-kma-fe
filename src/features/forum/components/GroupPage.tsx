import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Settings, ChevronLeft, Loader2, Shield, Crown, 
  UserMinus, UserPlus, MoreVertical, Globe, Lock
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { GroupService } from '../services/group.service';
import { PostService } from '../services/post.service';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import type { Group, GroupMember, GroupMemberCheck, ApiPost } from '../types/post.types';

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<GroupMemberCheck | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId && activeTab === 'posts') {
      loadPosts(0);
    } else if (groupId && activeTab === 'members') {
      loadMembers();
    }
  }, [groupId, activeTab]);

  const loadGroupData = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [groupData, membershipData] = await Promise.all([
        GroupService.getGroupById(groupId),
        GroupService.checkMembership(groupId),
      ]);
      
      setGroup(groupData);
      setMembership(membershipData);
    } catch (err: any) {
      console.error('Failed to load group:', err);
      setError(err.message || 'Không thể tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (pageNum: number = 0) => {
    if (!groupId) return;
    
    try {
      setLoadingPosts(true);
      const response = await PostService.getFeedByGroup(groupId, { 
        page: pageNum, 
        limit: 10,
        sort: 'createdAt,DESC'
      });
      
      if (pageNum === 0) {
        setPosts(response.content);
      } else {
        setPosts(prev => [...prev, ...response.content]);
      }
      
      setHasMore(pageNum < response.totalPages - 1);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadMembers = async () => {
    if (!groupId) return;
    
    try {
      setLoadingMembers(true);
      const response = await GroupService.getGroupMembers(groupId, { page: 0, limit: 50 });
      setMembers(response.content);
    } catch (err: any) {
      console.error('Failed to load members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupId) return;
    
    try {
      await GroupService.joinGroup({ groupId });
      await loadGroupData();
    } catch (err: any) {
      console.error('Failed to join group:', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId) return;
    
    try {
      await GroupService.leaveGroup(groupId);
      await loadGroupData();
    } catch (err: any) {
      console.error('Failed to leave group:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!groupId || !membership?.canManageMembers) return;
    
    try {
      await GroupService.removeMember(groupId, userId);
      await loadMembers();
      await loadGroupData();
    } catch (err: any) {
      console.error('Failed to remove member:', err);
    }
  };

  const handleUpdateRole = async (userId: string, role: 'ADMIN' | 'MEMBER') => {
    if (!groupId || !membership?.canManageMembers) return;
    
    try {
      await GroupService.updateMemberRole(groupId, { userId, role });
      await loadMembers();
    } catch (err: any) {
      console.error('Failed to update role:', err);
    }
  };

  const handlePostCreated = () => {
    loadPosts(0);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Chủ nhóm</span>;
      case 'ADMIN':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Quản trị viên</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Thành viên</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error || 'Không tìm thấy nhóm'}</p>
        <Button onClick={() => navigate('/forum')}>Quay lại</Button>
      </div>
    );
  }

  const groupName = group.groupName || group.name || 'Nhóm';
  const isPublic = group.visibility === 'PUBLIC' || group.privacy === 'PUBLIC';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <button 
            onClick={() => navigate('/forum')}
            className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Quay lại
          </button>
          
          {membership?.isOwner && (
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {groupName[0]?.toUpperCase()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{groupName}</h1>
              {isPublic ? (
                <span title="Công khai">
                  <Globe className="w-5 h-5 text-green-500" />
                </span>
              ) : (
                <span title="Riêng tư">
                  <Lock className="w-5 h-5 text-amber-500" />
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1">{group.description || 'Không có mô tả'}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.memberCount} thành viên
              </span>
            </div>
          </div>
          
          <div>
            {membership?.isMember ? (
              membership.isOwner ? (
                <Button disabled variant="outline">
                  <Crown className="w-4 h-4 mr-2 text-amber-500" />
                  Chủ nhóm
                </Button>
              ) : (
                <Button variant="outline" onClick={handleLeaveGroup}>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Rời nhóm
                </Button>
              )
            ) : (
              <Button onClick={handleJoinGroup}>
                <UserPlus className="w-4 h-4 mr-2" />
                Tham gia
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 mb-6 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Bài viết
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Thành viên ({group.memberCount})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'posts' && (
        <div>
          {membership?.canPost && (
            <CreatePost onPostCreated={handlePostCreated} defaultGroupId={groupId} />
          )}
          
          {loadingPosts && posts.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">Chưa có bài viết nào trong nhóm này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  onReactionChange={handleReactionChange}
                />
              ))}
              
              {hasMore && (
                <div className="flex justify-center py-4">
                  <Button onClick={() => loadPosts(page + 1)} disabled={loadingPosts}>
                    {loadingPosts ? (
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
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {loadingMembers ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">Không có thành viên nào</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{member.userName}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getRoleBadge(member.role)}
                        <span className="text-xs text-slate-400">
                          Tham gia {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {membership?.canManageMembers && member.role !== 'OWNER' && (
                    <div className="flex items-center gap-2">
                      {membership.isOwner && member.role === 'MEMBER' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateRole(member.userId, 'ADMIN')}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          Thăng Admin
                        </Button>
                      )}
                      {membership.isOwner && member.role === 'ADMIN' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateRole(member.userId, 'MEMBER')}
                        >
                          Hạ thành viên
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
