import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import ForumFeed from './ForumFeed';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Search, Bell, User, LogOut, Settings, ChevronDown, Plus, Sparkles, Users } from 'lucide-react';
import { ChatHeaderIcon } from '../../chat';
import { useAuthStore } from '../../../store/useStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';

interface MainForumProps {
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenMiniChat?: (conversation: any) => void;
  children?: React.ReactNode;
}

export default function MainForum({ onLogout, onOpenNotifications, onOpenMiniChat, children }: MainForumProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User' : 'User';
  const displayEmail = user?.email || 'student@university.edu';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16">
        <div className="flex items-center justify-between h-full px-5 max-w-[1600px] mx-auto">
          {/* Logo */}
          <Link to="/forum" className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3 hidden md:block">
                Forum KMA
              </span>
            </div>
          </Link>

          {/* Search Bar - Centered */}
          <div className="flex-1 max-w-2xl mx-auto px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#878A8C]" />
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết, chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-slate-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:bg-slate-50 transition-all text-sm shadow-inner"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1">
            <ChatHeaderIcon onOpenMiniChat={onOpenMiniChat} />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded hover:bg-[#F6F7F8]"
              onClick={() => onOpenNotifications?.()}
            >
              <Bell className="w-5 h-5 text-[#878A8C]" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-3 border border-transparent hover:border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="font-semibold text-sm text-slate-900">{displayName}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl border-0 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-blue-100 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Online
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-100 truncate">{displayEmail}</p>
                  <div className="mt-3 text-center">
                    <p className="text-2xl font-bold text-white">245</p>
                    <p className="text-xs text-blue-100">bài viết</p>
                  </div>
                </div>
                <div className="p-2">
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-3 hover:bg-slate-50">
                    <Link to="/profile" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-900">Trang cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-xl p-3 hover:bg-slate-50">
                    <Link to="/settings" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-slate-900">Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="p-2">
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-xl p-3 hover:bg-red-50 text-red-600">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium">Đăng xuất</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content - Full width layout */}
      <div className="flex w-full pt-5 px-4 gap-4 max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <Sidebar />
        </div>

        {/* Feed */}
        <div className="flex-1 min-w-0">
          {children ?? <ForumFeed />}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 hidden xl:block">
          <div className="sticky top-20">
            <div className="space-y-4">
              {/* Trending Topics */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Xu hướng hôm nay</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { tag: '#LậpTrình', posts: '245 bài viết' },
                    { tag: '#HọcTập', posts: '189 bài viết' },
                    { tag: '#ThiKMA', posts: '156 bài viết' },
                    { tag: '#DevTips', posts: '134 bài viết' },
                    { tag: '#CodeReview', posts: '98 bài viết' },
                  ].map((item, idx) => (
                    <button key={idx} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">{item.tag}</span>
                      </div>
                      <span className="text-xs text-slate-500">{item.posts}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/25">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Forum KMA
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Thành viên</span>
                    <span className="font-semibold">12,453</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Online</span>
                    <span className="font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      1,234
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Bài viết hôm nay</span>
                    <span className="font-semibold">567</span>
                  </div>
                </div>
              </div>

              {/* Community Rules */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">Quy tắc cộng đồng</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">1.</span>
                    <span>Tôn trọng mọi người</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">2.</span>
                    <span>Không spam hoặc quảng cáo</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">3.</span>
                    <span>Nội dung phù hợp với học tập</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">4.</span>
                    <span>Không chia sẻ thông tin cá nhân</span>
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-xs text-slate-500 space-y-1 px-2">
                <div className="flex flex-wrap gap-2">
                  <button className="hover:underline">Về chúng tôi</button>
                  <span>•</span>
                  <button className="hover:underline">Điều khoản</button>
                  <span>•</span>
                  <button className="hover:underline">Chính sách</button>
                </div>
                <p>© 2025 Forum KMA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}