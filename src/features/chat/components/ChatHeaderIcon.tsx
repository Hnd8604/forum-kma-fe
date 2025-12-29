import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface ChatHeaderIconProps {
  onOpenMiniChat?: (conversation: Conversation) => void;
}

export default function ChatHeaderIcon({ onOpenMiniChat }: ChatHeaderIconProps) {
  const navigate = useNavigate();
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

  const handleOpenFullChat = () => {
    setIsOpen(false);
    navigate('/chat');
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setIsOpen(false);
    if (onOpenMiniChat) {
      onOpenMiniChat(conversation);
    } else {
      // If no mini chat handler, navigate to full chat page
      navigate('/chat');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-red-50 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <ChatDropdown
          onOpenFullChat={handleOpenFullChat}
          onSelectConversation={handleSelectConversation}
          onRefresh={loadUnreadCount}
        />
      </PopoverContent>
    </Popover>
  );
}
