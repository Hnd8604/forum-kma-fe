import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useStore';
import { AdminService, AdminStats } from '@/features/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, MessageSquare, Shield, UsersRound, RefreshCw, Loader2, TrendingUp, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Try to get real stats, fallback to fetching counts from individual endpoints
      const [usersResponse, postsResponse, groupsResponse] = await Promise.allSettled([
        AdminService.getAllUsers(0, 1),
        AdminService.getAllPosts(0, 1),
        AdminService.getAllGroups(0, 1),
      ]);

      const totalUsers = usersResponse.status === 'fulfilled' ? usersResponse.value.totalElements : 0;
      const totalPosts = postsResponse.status === 'fulfilled' ? postsResponse.value.totalElements : 0;
      const totalGroups = groupsResponse.status === 'fulfilled' ? groupsResponse.value.totalElements : 0;

      setStats({
        totalUsers,
        activeUsers: totalUsers,
        bannedUsers: 0,
        totalPosts,
        totalGroups,
        totalComments: 0,
        pendingReports: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Tổng Người Dùng',
      value: stats?.totalUsers ?? '-',
      icon: Users,
      description: 'Người dùng đã đăng ký',
      onClick: () => navigate('/admin/users'),
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Tổng Bài Viết',
      value: stats?.totalPosts ?? '-',
      icon: FileText,
      description: 'Bài viết đã đăng',
      onClick: () => navigate('/admin/posts'),
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Tổng Nhóm',
      value: stats?.totalGroups ?? '-',
      icon: UsersRound,
      description: 'Nhóm hoạt động',
      onClick: () => navigate('/admin/groups'),
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Báo Cáo Chờ Xử Lý',
      value: stats?.pendingReports ?? 0,
      icon: Shield,
      description: 'Cần xem xét',
      onClick: () => navigate('/admin/reports'),
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Activity className="h-10 w-10" />
              Admin Dashboard
            </h1>
            <p className="text-blue-100 text-lg flex items-center gap-2">
              <span>Chào mừng</span>
              <span className="font-semibold">{user?.firstName} {user?.lastName}</span>
              <TrendingUp className="h-5 w-5" />
            </p>
          </div>
          <Button 
            variant="secondary" 
            onClick={fetchStats} 
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Card 
            key={card.title} 
            className={`cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br ${card.bgGradient} overflow-hidden group animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {card.title}
              </CardTitle>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : card.value}
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Thao Tác Nhanh</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                Quản Lý Người Dùng
              </CardTitle>
              <CardDescription className="text-base">
                Xem, tìm kiếm, cấm/bỏ cấm người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg" 
                onClick={() => navigate('/admin/users')}
              >
                Xem Danh Sách
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                Quản Lý Bài Viết
              </CardTitle>
              <CardDescription className="text-base">
                Kiểm duyệt và quản lý bài viết
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" 
                onClick={() => navigate('/admin/posts')}
              >
                Xem Danh Sách
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-green-100 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <UsersRound className="h-6 w-6 text-white" />
                </div>
                Quản Lý Nhóm
              </CardTitle>
              <CardDescription className="text-base">
                Quản lý các nhóm trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                onClick={() => navigate('/admin/groups')}
              >
                Xem Danh Sách
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-indigo-100 dark:border-indigo-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                Quản Lý Vai Trò
              </CardTitle>
              <CardDescription className="text-base">
                Tạo và quản lý vai trò, quyền hạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg" 
                onClick={() => navigate('/admin/roles')}
              >
                Xem Danh Sách
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-100 dark:border-orange-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                Báo Cáo Vi Phạm
              </CardTitle>
              <CardDescription className="text-base">
                Xem và xử lý các báo cáo vi phạm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg" 
                variant="outline"
                onClick={() => navigate('/admin/reports')}
              >
                Xem Báo Cáo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
