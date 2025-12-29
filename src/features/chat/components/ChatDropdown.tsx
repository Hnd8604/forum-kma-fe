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
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tin nhắn</h3>
          <p className="text-xs text-slate-500 mt-0.5">{conversations.length} cuộc hội thoại</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenFullChat}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl gap-1 font-medium"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-[420px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Chưa có tin nhắn nào</p>
            <p className="text-xs text-slate-400 mt-1">Hãy bắt đầu trò chuyện!</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                onClick={() => onSelectConversation(conversation)}
                className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all rounded-xl mb-1 border border-transparent hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                      {conversation.type === 'GROUP' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <MessageCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/40">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate text-slate-900">
                        {conversation.type === 'PRIVATE'
                          ? userNames[conversation.participants.find((p) => p !== currentUser?.userId) || ''] || conversation.name
                          : conversation.name}
                      </h4>
                      {conversation.lastMessage && (
                        <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                          {new Date(conversation.lastMessage.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${
                      conversation.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'
                    }`}>
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
