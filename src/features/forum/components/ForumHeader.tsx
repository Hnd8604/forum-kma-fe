import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, LogOut, Settings, ChevronDown, UserPlus, Users } from 'lucide-react';
import { ChatHeaderIcon } from '../../chat';
import SearchDropdown from './SearchDropdown';
import { useAuthStore } from '@/store/useStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ForumHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenMiniChat?: (conversation: any) => void;
  onOpenFriendsList?: () => void;
}

export default function ForumHeader({
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenMiniChat,
  onOpenFriendsList: _onOpenFriendsList,
}: ForumHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User' : 'User';
  const displayEmail = user?.email || 'student@university.edu';
  const displayPostCount = user?.totalPosts ?? user?.postCount ?? 0;
  const avatarUrl = user?.avatarUrl;

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md h-16 border-b border-slate-200/80">
      <div className="flex items-center justify-between h-full px-5 max-w-full mx-auto">
        {/* Logo */}
        <Link to="/forum" className="flex items-center space-x-2 cursor-pointer flex-shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#878A8C] z-10" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm bài viết, chủ đề..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-10 pr-4 h-10 bg-slate-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none hover:bg-slate-50 transition-all text-sm shadow-inner"
            />

            {/* Search Dropdown */}
            <SearchDropdown
              searchQuery={searchQuery}
              isOpen={isSearchFocused && searchQuery.trim().length > 0}
              onClose={() => setIsSearchFocused(false)}
              inputRef={searchInputRef}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1">
          <ChatHeaderIcon onOpenMiniChat={onOpenMiniChat} />

          {/* Friends Icon */}
          <Link to="/friends">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Users className="w-5 h-5 text-gray-700" />
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-10 px-3 border border-transparent hover:border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="font-semibold text-sm text-slate-900">{displayName}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl border-0 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-white/20 text-white text-lg">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{displayName}</p>
                  </div>
                </div>
                <p className="text-xs text-blue-100 truncate">{displayEmail}</p>
                <div className="mt-3 text-center">
                  <p className="text-2xl font-bold text-white">{displayPostCount}</p>
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
                  <Link to="/friends" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium text-slate-900">Bạn bè</span>
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
  );
}
