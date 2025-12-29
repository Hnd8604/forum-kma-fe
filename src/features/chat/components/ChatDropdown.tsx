import { useState, useEffect } from 'react';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import { useAuthStore } from '../../../store/useStore';
import type { Conversation } from '../types/chat.types';
import { Button } from '../../../shared/components/ui/button';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Badge } from '../../../shared/components/ui/badge';
import { MessageCircle, Users, ArrowRight } from 'lucide-react';

interface ChatDropdownProps {
  onOpenFullChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onRefresh?: () => void;
}

export default function ChatDropdown({
  onOpenFullChat,
  onSelectConversation,
  onRefresh,
}: ChatDropdownProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await ChatService.getConversations();
      const list = data.slice(0, 5);
      setConversations(list);
      // Resolve participant names for private convos
      if (currentUser) {
        const idsToFetch = new Set<string>();
        list.forEach((conv) => {
          if (conv.type === 'PRIVATE' && conv.participants && conv.participants.length) {
            const other = conv.participants.find((p) => p !== currentUser.userId);
            if (other && !userNames[other]) idsToFetch.add(other);
          }
        });

        if (idsToFetch.size > 0) {
          const fetches = Array.from(idsToFetch).map(async (id) => {
            try {
              const u = await AuthService.getUserById(id);
              return { id, name: `${u.firstName || u.username || ''} ${u.lastName || ''}`.trim() || u.username || id };
            } catch (err) {
              console.error('Failed to fetch user', id, err);
              return { id, name: id };
            }
          });

          const results = await Promise.all(fetches);
          setUserNames((prev) => {
            const next = { ...prev };
            results.forEach((r) => (next[r.id] = r.name));
            return next;
          });
        }
      }
      onRefresh?.();
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Tin nhắn</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenFullChat}
          className="text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500 text-sm">Đang tải...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">Chưa có tin nhắn nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                onClick={() => onSelectConversation(conversation)}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {conversation.type === 'GROUP' ? (
                      <Users className="w-5 h-5 text-white" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.type === 'PRIVATE'
                          ? userNames[conversation.participants.find((p) => p !== currentUser?.userId) || ''] || conversation.name
                          : conversation.name}
                      </h4>
                      {conversation.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 bg-red-500 flex-shrink-0 h-5 min-w-5 text-xs"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {conversation.lastMessage?.message || 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
