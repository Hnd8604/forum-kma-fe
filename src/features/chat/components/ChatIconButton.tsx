import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover';
import ChatDropdown from './ChatDropdown';
import { ChatService } from '../services/chat.service';
import type { Conversation } from '../types/chat.types';

interface ChatIconButtonProps {
  onOpenFullChat: () => void;
  onOpenMiniChat: (conversation: Conversation) => void;
}

export default function ChatIconButton({ onOpenFullChat, onOpenMiniChat }: ChatIconButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const conversations = await ChatService.getConversations();
      const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      setUnreadCount(total);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <ChatDropdown
          onOpenFullChat={() => {
            setIsOpen(false);
            onOpenFullChat();
          }}
          onSelectConversation={(conv) => {
            setIsOpen(false);
            onOpenMiniChat(conv);
          }}
          onRefresh={loadUnreadCount}
        />
      </PopoverContent>
    </Popover>
  );
}
