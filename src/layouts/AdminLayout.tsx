import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useStore';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  UsersRound,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Quản Lý Người Dùng', path: '/admin/users' },
    { icon: FileText, label: 'Quản Lý Bài Viết', path: '/admin/posts' },
    { icon: UsersRound, label: 'Quản Lý Nhóm', path: '/admin/groups' },
    { icon: Shield, label: 'Quản Lý Vai Trò', path: '/admin/roles' },
    { icon: MessageSquare, label: 'Báo Cáo Vi Phạm', path: '/admin/reports' },
    { icon: Settings, label: 'Cài Đặt', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToForum = () => {
    navigate('/forum');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Top Navigation */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white rounded-lg transition-all duration-200 group"
            >
              {sidebarOpen ? <X className="h-5 w-5 group-hover:scale-110 transition-transform" /> : <Menu className="h-5 w-5 group-hover:scale-110 transition-transform" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToForum}
              className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Về Trang Chủ
            </button>
            <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {user?.roleName || 'Admin'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white rounded-lg transition-all duration-200 group"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl transition-all duration-300 z-20 ${
            sidebarOpen ? 'w-72' : 'w-0'
          } overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:scale-102'
                  }`}
                >
                  <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-72' : 'ml-0'
          }`}
        >
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
