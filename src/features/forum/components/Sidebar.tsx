import { Home, TrendingUp, Users, BookOpen, Code, Palette, Music, Dumbbell, Globe, Plus } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Separator } from '../../../shared/components/ui/separator';

const popularGroups = [
  { id: 1, name: 'Trang chủ', icon: Home, members: null, color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 2, name: 'Phổ biến', icon: TrendingUp, members: null, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
];

const groups = [
  { id: 3, name: 'Khoa học Máy tính', icon: Code, members: 15420, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 4, name: 'Kinh tế & Quản trị', icon: BookOpen, members: 12350, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 5, name: 'Nghệ thuật & Thiết kế', icon: Palette, members: 8920, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 6, name: 'Âm nhạc', icon: Music, members: 7540, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { id: 7, name: 'Thể thao & Sức khỏe', icon: Dumbbell, members: 9230, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 8, name: 'Ngôn ngữ', icon: Globe, members: 11240, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 9, name: 'Toán học', icon: BookOpen, members: 6780, color: 'text-red-500', bgColor: 'bg-red-50' },
  { id: 10, name: 'Văn học', icon: BookOpen, members: 5420, color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
];

export default function Sidebar() {
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
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant="ghost"
                  className="w-full justify-start hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50/50 rounded-xl h-auto py-3 transition-all group"
                >
                  <div className="flex items-center w-full">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${group.bgColor} mr-3 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <group.icon className={`w-5 h-5 ${group.color}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="truncate text-sm group-hover:translate-x-1 transition-transform">{group.name}</div>
                      <div className="text-xs text-gray-500">
                        {group.members.toLocaleString('vi-VN')} thành viên
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
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