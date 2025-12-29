import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Users, BookOpen, Code, Palette, Music, Dumbbell, Globe, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Separator } from '../../../shared/components/ui/separator';
import { GroupService } from '../services/group.service';
import type { Group } from '../types/post.types';

const popularGroups = [
  { id: 1, name: 'Trang chủ', icon: Home, members: null, color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 2, name: 'Phổ biến', icon: TrendingUp, members: null, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
];

// Icon mapping for different group types
const iconMap: Record<string, any> = {
  'code': Code,
  'book': BookOpen,
  'palette': Palette,
  'music': Music,
  'dumbbell': Dumbbell,
  'globe': Globe,
  'users': Users,
};

const colorCombos = [
  { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { color: 'text-green-600', bgColor: 'bg-green-50' },
  { color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { color: 'text-red-500', bgColor: 'bg-red-50' },
  { color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyGroups();
  }, []);

  const loadMyGroups = async () => {
    try {
      setLoading(true);
      const myGroups = await GroupService.getMyGroups({ limit: 50 });
      setGroups(myGroups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const getGroupIcon = (index: number) => {
    const icons = [Code, BookOpen, Palette, Music, Dumbbell, Globe, Users];
    return icons[index % icons.length];
  };

  const getColorCombo = (index: number) => {
    return colorCombos[index % colorCombos.length];
  };

  return (
    <aside className="w-72 bg-white/60 backdrop-blur-sm border-r border-red-100 h-[calc(100vh-65px)] sticky top-[65px]">
      <ScrollArea className="h-full">
        <div className="p-4">
          {/* Quick Links */}
          <div className="space-y-1 mb-6">
            {popularGroups.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  if (item.id === 1) {
                    // Trang chủ
                    navigate('/forum');
                  }
                  // Can add more handlers for other items
                }}
                className="w-full justify-start hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 rounded-xl transition-all group h-12"
              >
                <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${item.bgColor} mr-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
              </Button>
            ))}
          </div>

          <Separator className="my-4 bg-red-100" />

          {/* Groups Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-gray-700">Nhóm của bạn</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                  <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
                </div>
              ) : groups.length > 0 ? (
                groups.map((group, index) => {
                  const GroupIcon = getGroupIcon(index);
                  const { color, bgColor } = getColorCombo(index);
                  const groupName = group.groupName || group.name || 'Nhóm';
                  
                  return (
                    <Button
                      key={group.groupId}
                      variant="ghost"
                      className="w-full justify-start hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50/50 rounded-xl h-auto py-3 transition-all group"
                    >
                      <div className="flex items-center w-full">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bgColor} mr-3 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <GroupIcon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="truncate text-sm group-hover:translate-x-1 transition-transform">{groupName}</div>
                          <div className="text-xs text-gray-500">
                            {group.memberCount.toLocaleString('vi-VN')} thành viên
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  Bạn chưa tham gia nhóm nào
                </div>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-4 border-t border-red-100">
            <div className="space-y-2 text-xs text-gray-500">
              <a href="#" className="block hover:text-red-600 hover:underline transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                Về chúng tôi
              </a>
              <a href="#" className="block hover:text-red-600 hover:underline transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                Điều khoản
              </a>
              <a href="#" className="block hover:text-red-600 hover:underline transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                Chính sách bảo mật
              </a>
              <a href="#" className="block hover:text-red-600 hover:underline transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                Trợ giúp
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-400 px-2">© 2025 Forum Sinh Viên</p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}