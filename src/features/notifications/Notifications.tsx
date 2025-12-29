import { useEffect, useState } from 'react';
import { X, Bell, MessageSquare, Newspaper, Settings } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/ui/card';
import { ScrollArea } from '../../shared/components/ui/scroll-area';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  type?: 'message' | 'post' | 'system';
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
    { id: '1', title: 'Bài mới', message: 'Có bài viết mới trong chủ đề bạn theo dõi.', time: '09:12', read: true, type: 'post' },
    { id: '2', title: 'Tin nhắn mới', message: 'Bạn có 1 tin nhắn chưa đọc.', time: '09:30', read: false, type: 'message' },
    { id: '3', title: 'Cập nhật hệ thống', message: 'Bảo trì hệ thống vào 22:00 hôm nay.', time: '07:30', read: true, type: 'system' },
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

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'post':
        return Newspaper;
      case 'system':
        return Settings;
      default:
        return Bell;
    }
  };

  const getIconColor = (type?: string) => {
    switch (type) {
      case 'message':
        return 'from-blue-500 to-indigo-500';
      case 'post':
        return 'from-green-500 to-emerald-500';
      case 'system':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <>
      {/* Notifications Panel (triggered from header bell) */}
      {isOpen && (
        <Card className="fixed top-16 right-4 w-[400px] h-[480px] z-50 shadow-2xl flex flex-col overflow-hidden border-0 bg-white rounded-2xl">
          <div className="p-5 flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 border-b border-white/20">
            <div>
              <h3 className="font-bold text-xl text-white">Thông báo</h3>
              <p className="text-xs text-blue-100 mt-0.5">{unreadCount > 0 ? `${unreadCount} thông báo mới` : 'Tất cả đã đọc'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-white hover:bg-white/20 rounded-xl" 
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
            <div className="p-2">
              {displayed.map((it) => {
                const Icon = getNotificationIcon(it.type);
                const iconColor = getIconColor(it.type);
                
                return (
                  <div
                    key={it.id}
                    className={`rounded-xl mb-2 p-3 transition-all border ${
                      it.read 
                        ? 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold ${it.read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {it.title}
                          </p>
                          <span className="text-xs text-slate-400 flex-shrink-0">{it.time}</span>
                        </div>
                        <p className={`text-xs ${it.read ? 'text-slate-500' : 'text-slate-700'} leading-relaxed`}>
                          {it.message}
                        </p>
                        {!it.read && (
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-slate-200 bg-white">
            <Button
              variant="ghost"
              className="w-full font-semibold text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
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
