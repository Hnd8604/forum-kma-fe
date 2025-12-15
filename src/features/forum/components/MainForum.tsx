import { useState } from 'react';
import Sidebar from './Sidebar';
import ForumFeed from './ForumFeed';
import ChatMessenger from '../../chat/components/ChatMessenger';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { GraduationCap, Search, Bell, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import { Badge } from '../../../shared/components/ui/badge';

interface MainForumProps {
  onLogout: () => void;
  onOpenNotifications?: () => void;
}

export default function MainForum({ onLogout, onOpenNotifications }: MainForumProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-red-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-red-600 to-red-500 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Forum Sinh Viên
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết, nhóm, người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 bg-gray-100/80 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-200 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-red-50 rounded-xl transition-colors"
              onClick={() => onOpenNotifications?.()}
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                3
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-red-50 rounded-xl transition-colors px-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center">
                    <span className="text-white text-sm">B</span>
                  </div>
                  <span className="text-sm">Bạn</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm">student@university.edu</p>
                </div>
                <DropdownMenuItem className="cursor-pointer rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  Trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer rounded-lg">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Feed */}
        <ForumFeed />
      </div>

      {/* Chat Messenger */}
      <ChatMessenger />
    </div>
  );
}