import { useState } from 'react';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Input } from '../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { Image, Link2, Smile, X } from 'lucide-react';
import { usePostsStore } from '../../../store/useStore';
import { useAuthStore } from '../../../store/useStore';

const groups = [
  'Khoa học Máy tính',
  'Kinh tế & Quản trị',
  'Nghệ thuật & Thiết kế',
  'Ngôn ngữ',
  'Thể thao & Sức khỏe',
  'Toán học',
  'Văn học',
  'Âm nhạc',
];

export default function CreatePost() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const addPost = usePostsStore((state) => state.addPost);
  const user = useAuthStore((state) => state.user);

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      addPost({
        title: title.trim(),
        content: content.trim(),
        group: selectedGroup || user?.group,
      });
      setTitle('');
      setContent('');
      setSelectedGroup('');
      setIsExpanded(false);
    }
  };

  return (
    <Card className="p-5 bg-white/80 backdrop-blur-sm border border-red-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-yellow-400 flex items-center justify-center shadow-md ring-2 ring-white group-hover:scale-110 transition-transform">
            <span className="text-white">B</span>
          </div>
          <div className="flex-1 bg-gradient-to-r from-gray-100 to-red-50/50 rounded-full px-5 py-3 text-gray-500 hover:from-gray-200 hover:to-red-100/50 transition-all">
            Bạn đang nghĩ gì? ✨
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 via-red-400 to-yellow-400 flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white">B</span>
              </div>
              <div>
                <p>Tạo bài viết mới</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsExpanded(false);
                setTitle('');
                setContent('');
              }}
              className="rounded-lg hover:bg-red-50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Input
            placeholder="Tiêu đề bài viết..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-gray-300 rounded-xl h-12 focus:border-red-300 focus:ring-red-200"
          />

          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="border-gray-300 rounded-xl h-12 focus:border-red-300 focus:ring-red-200">
              <SelectValue placeholder="Chọn nhóm (tùy chọn)" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Nội dung bài viết của bạn... 💭"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[140px] border-gray-300 resize-none rounded-xl focus:border-red-300 focus:ring-red-200"
          />

          <div className="flex items-center justify-between pt-3 border-t border-red-100">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                <Image className="w-4 h-4 mr-2" />
                Ảnh
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                <Link2 className="w-4 h-4 mr-2" />
                Link
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors">
                <Smile className="w-4 h-4 mr-2" />
                Emoji
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setContent('');
                }}
                className="rounded-xl hover:bg-gray-50"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={!title.trim() || !content.trim()}
              >
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}