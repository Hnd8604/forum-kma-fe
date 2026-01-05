import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useStore';
import { AdminService, AdminStats } from '@/features/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, MessageSquare, Shield, UsersRound, RefreshCw, Loader2, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
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
      title: 'Người Dùng',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      description: 'Tổng số tài khoản',
      onClick: () => navigate('/admin/users'),
      color: 'bg-blue-500',
    },
    {
      title: 'Bài Viết',
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      description: 'Bài viết đã đăng',
      onClick: () => navigate('/admin/posts'),
      color: 'bg-emerald-500',
    },
    {
      title: 'Nhóm',
      value: stats?.totalGroups ?? 0,
      icon: UsersRound,
      description: 'Nhóm hoạt động',
      onClick: () => navigate('/admin/groups'),
      color: 'bg-violet-500',
    },
    {
      title: 'Báo Cáo',
      value: stats?.pendingReports ?? 0,
      icon: Shield,
      description: 'Chờ xử lý',
      onClick: () => navigate('/admin/reports'),
      color: 'bg-amber-500',
    },
  ];

  const quickActions = [
    {
      title: 'Quản Lý Người Dùng',
      description: 'Xem danh sách, cấm hoặc bỏ cấm người dùng',
      icon: Users,
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Quản Lý Bài Viết',
      description: 'Kiểm duyệt và quản lý nội dung bài viết',
      icon: FileText,
      onClick: () => navigate('/admin/posts'),
    },
    {
      title: 'Quản Lý Nhóm',
      description: 'Quản lý các nhóm trong hệ thống',
      icon: UsersRound,
      onClick: () => navigate('/admin/groups'),
    },
    {
      title: 'Quản Lý Vai Trò',
      description: 'Tạo và phân quyền vai trò',
      icon: Shield,
      onClick: () => navigate('/admin/roles'),
    },
    {
      title: 'Xử Lý Báo Cáo',
      description: 'Xem và xử lý các báo cáo vi phạm',
      icon: MessageSquare,
      onClick: () => navigate('/admin/reports'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Xin chào, {user?.firstName}!
          </h1>
          <p className="text-slate-500 mt-1">
            Đây là tổng quan về hoạt động của hệ thống
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStats}
          disabled={loading}
          className="border-slate-300"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-slate-200 bg-white group"
            onClick={card.onClick}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-800">{card.value}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{card.description}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Cập nhật mới nhất
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Thao Tác Nhanh</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="hover:shadow-md transition-all duration-200 border-slate-200 bg-white cursor-pointer group"
              onClick={action.onClick}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <action.icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-800">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 mt-0.5">
                      {action.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* System Info */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">Thông Tin Hệ Thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500">Phiên bản</p>
              <p className="text-sm font-medium text-slate-800 mt-1">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Môi trường</p>
              <p className="text-sm font-medium text-slate-800 mt-1">Production</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Trạng thái</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <p className="text-sm font-medium text-emerald-600">Hoạt động</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Cập nhật lần cuối</p>
              <p className="text-sm font-medium text-slate-800 mt-1">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
