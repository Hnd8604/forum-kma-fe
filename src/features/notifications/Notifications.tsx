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

  // Fake test data: one unread notification
  const [items, setItems] = useState<NotificationItem[]>([
    { id: '1', title: 'Bài mới', message: 'Có bài viết mới trong chủ đề bạn theo dõi.', time: '09:12', read: true },
    { id: '2', title: 'Tin nhắn mới', message: 'Bạn có 1 tin nhắn chưa đọc.', time: '09:30', read: false },
    { id: '3', title: 'Cập nhật hệ thống', message: 'Bảo trì hệ thống vào 22:00 hôm nay.', time: '07:30', read: true },
  ]);

  const unreadCount = items.filter(i => !i.read).length;

  // Displayed items: newest first (sort by time string "HH:MM")
  const parseTime = (t: string) => {
    const [hh, mm] = t.split(':').map((n) => Number(n));
    return hh * 60 + (mm || 0);
  };

  const displayed = [...items].sort((a, b) => parseTime(b.time) - parseTime(a.time));

  useEffect(() => {
    if (isOpen) {
      // mark visible as read after opening (optional behaviour)
      // NOTE: Remove automatic marking on open so read/unread states remain visible
    }
  }, [isOpen]);

  return (
    <>
      {/* Notifications Panel (triggered from header bell) */}
      {isOpen && (
        <Card className="fixed top-14 right-4 w-[360px] h-[440px] z-50 shadow-xl flex flex-col overflow-hidden border border-gray-200 bg-white">
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-yellow-400 to-pink-400 text-white rounded-t-xl">
            <div>
              <h3 className="font-semibold">Thông báo</h3>
              <p className="text-xs">Mới nhất</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => handleOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto bg-white">
            <div className="divide-y divide-gray-100">
              {displayed.map((it) => (
                <div
                  key={it.id}
                  className={`${it.read ? 'bg-white' : 'bg-gray-50'} px-4 py-3 flex items-start justify-between`}
                >
                  <div className="flex items-start gap-3">
                    <div>
                      <p className={`${it.read ? 'text-sm font-medium text-gray-700' : 'text-sm font-semibold text-gray-800'}`}>{it.title}</p>
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{it.message}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 ml-2">{it.time}</div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-gray-100 bg-white">
            <Button
              variant="ghost"
              className="w-full font-semibold text-sm"
              onClick={() => setItems((prev) => prev.map((i) => ({ ...i, read: true })))}
            >
              Đánh dấu tất cả là đã đọc
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
