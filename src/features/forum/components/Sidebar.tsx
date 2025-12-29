import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Users, ChevronDown, ChevronUp, Plus, Loader2, Flame, Star, Clock } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { GroupService } from '../services/group.service';
import type { Group } from '../types/post.types';

const feedOptions = [
  { id: 'home', name: 'Trang chủ', icon: Home },
  { id: 'popular', name: 'Phổ biến', icon: TrendingUp },
  { id: 'all', name: 'Tất cả', icon: Flame },
];

// Generate colors for communities - professional palette
const communityColors = [
  '#1e3a5f', '#2d5a87', '#3d7ab5', '#1a5f7a', '#2e8b57',
  '#4682b4', '#5f9ea0', '#6b8e9f', '#708090', '#4a6fa5',
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCommunities, setShowCommunities] = useState(true);
  const [showRecent, setShowRecent] = useState(true);

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

  const getRandomColor = (index: number) => {
    return communityColors[index % communityColors.length];
  };

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 mr-6">
      <div className="pr-2 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Feed Options */}
            <div className="mb-4">
              {feedOptions.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => {
                    if (item.id === 'home') {
                      navigate('/forum');
                    }
                  }}
                  className="w-full justify-start h-10 px-3 rounded hover:bg-[#EAEDEF] text-sm font-normal text-[#1C1C1C]"
                >
                  <item.icon className="w-5 h-5 mr-3 text-[#878A8C]" />
                  {item.name}
                </Button>
              ))}
            </div>

            <div className="border-t border-[#EDEFF1] my-3"></div>

            {/* Recent Communities */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
              <button 
                onClick={() => setShowRecent(!showRecent)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
              >
                <span>Gần đây</span>
                {showRecent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showRecent && (
                <div className="space-y-1 mt-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11 px-3 rounded-xl hover:bg-slate-100 text-sm font-medium text-slate-700 transition-all"
                  >
                    <Clock className="w-5 h-5 mr-3 text-slate-500" />
                    Xem gần đây
                  </Button>
                </div>
              )}
            </div>

            {/* Communities */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
              <button 
                onClick={() => setShowCommunities(!showCommunities)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
              >
                <span>Cộng đồng của bạn</span>
                {showCommunities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCommunities && (
                <div className="space-y-1 mt-1">
                  {/* Create Community Button */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11 px-3 rounded-xl hover:bg-blue-50 text-sm font-medium text-blue-600 transition-all"
                  >
                    <div className="w-6 h-6 mr-3 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-blue-500" />
                    </div>
                    Tạo cộng đồng
                  </Button>

                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  ) : groups.length > 0 ? (
                    groups.map((group, index) => {
                      const groupName = group.groupName || group.name || 'Nhóm';
                      const color = getRandomColor(index);
                      
                      return (
                        <Button
                          key={group.groupId}
                          variant="ghost"
                          className="w-full justify-start h-11 px-3 rounded-xl hover:bg-slate-100 text-sm font-medium text-slate-700 transition-all"
                        >
                          <div 
                            className="w-6 h-6 mr-3 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ backgroundColor: color }}
                          >
                            {groupName[0]?.toUpperCase()}
                          </div>
                          <span className="truncate">{groupName}</span>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 px-3 text-sm text-slate-500">
                      Bạn chưa tham gia cộng đồng nào
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-[#EDEFF1] my-3"></div>

            {/* Resources */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tài nguyên
              </div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 px-3 rounded-xl hover:bg-slate-100 text-sm font-medium text-slate-700 transition-all"
                >
                  <Users className="w-5 h-5 mr-3 text-slate-500" />
                  Giới thiệu Forum KMA
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 px-3 rounded-xl hover:bg-slate-100 text-sm font-medium text-slate-700 transition-all"
                >
                  <Star className="w-5 h-5 mr-3 text-amber-500" />
                  Hướng dẫn sử dụng
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 pb-4 px-3">
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex flex-wrap gap-x-3">
                  <a href="#" className="hover:text-blue-500 transition-colors">Về chúng tôi</a>
                  <a href="#" className="hover:text-blue-500 transition-colors">Điều khoản</a>
                  <a href="#" className="hover:text-blue-500 transition-colors">Chính sách</a>
                </div>
                <p className="mt-2">&copy; 2025 Forum KMA</p>
              </div>
            </div>
      </div>
    </aside>
  );
}