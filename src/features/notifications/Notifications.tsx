import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/ui/card';
import { ScrollArea } from '../../shared/components/ui/scroll-area';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

interface NotificationsProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Notifications({ isOpen: externalIsOpen, onOpenChange }: NotificationsProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    else setInternalIsOpen(open);
  };

  const [items, setItems] = useState<NotificationItem[]>([
    { id: '1', title: 'Bài mới', message: 'Có bài viết mới trong chủ đề bạn theo dõi.', time: '09:12', read: false },
    { id: '2', title: 'Phản hồi', message: 'Ai đó đã phản hồi bài viết của bạn.', time: '08:50', read: false },
    { id: '3', title: 'Cập nhật hệ thống', message: 'Bảo trì hệ thống vào 22:00 hôm nay.', time: '07:30', read: true },
  ]);

  const unreadCount = items.filter(i => !i.read).length;

  useEffect(() => {
    if (isOpen) {
      // mark visible as read after opening (optional behaviour)
      setItems((prev) => prev.map(i => ({ ...i, read: true })));
    }
  }, [isOpen]);

  return (
    <>
      {/* Notifications Panel (triggered from header bell) */}
      {isOpen && (
        <Card className="fixed top-16 right-6 w-96 h-[420px] z-50 shadow-2xl flex flex-col overflow-hidden border-2">
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-yellow-400 to-pink-400 text-white">
            <div>
              <h3 className="font-semibold">Thông báo</h3>
              <p className="text-xs">Mới nhất</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => handleOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className={`p-3 rounded-lg ${it.read ? 'bg-white' : 'bg-gray-50'} border border-gray-100`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{it.title}</p>
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{it.message}</p>
                    </div>
                    <div className="text-xs text-gray-400 ml-2">{it.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-white">
            <Button variant="ghost" className="w-full" onClick={() => setItems([])}>
              Đánh dấu tất cả là đã đọc
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
