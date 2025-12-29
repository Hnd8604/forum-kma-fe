import { useState, useEffect } from 'react';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import type { Conversation } from '../types/chat.types';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Badge } from '../../../shared/components/ui/badge';
import { MessageCircle, Users, Plus } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  onCreateGroup?: () => void;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
  onCreateGroup,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChatService.getConversations();
      setConversations(data);

      // Resolve participant names for PRIVATE conversations
      if (currentUser) {
        const idsToFetch = new Set<string>();
        data.forEach((conv) => {
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
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Không thể tải danh sách hội thoại');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full p-4 border-0 rounded-none">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="text-slate-500">Đang tải...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full p-4 border-0 rounded-none">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-red-500">{error}</div>
          <Button onClick={loadConversations} variant="outline" className="rounded-xl">Thử lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-transparent">
      <div className="p-5 border-b border-slate-200/60 flex items-center justify-between backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tin nhắn</h2>
          <p className="text-xs text-slate-500 mt-0.5">{conversations.length} cuộc hội thoại</p>
        </div>
        {onCreateGroup && (
          <Button 
            size="sm" 
            onClick={onCreateGroup} 
            className="gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Nhóm mới
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-slate-500">Chưa có cuộc hội thoại nào</p>
          </div>
        ) : (
          <div className="p-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                onClick={() => onSelectConversation(conversation)}
                className={`p-3 cursor-pointer rounded-2xl mb-2 transition-all border ${
                  selectedConversationId === conversation.conversationId 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md shadow-blue-500/10' 
                    : 'hover:bg-white border-transparent hover:shadow-md hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                      {conversation.type === 'GROUP' ? (
                        <Users className="w-7 h-7 text-white" />
                      ) : (
                        <MessageCircle className="w-7 h-7 text-white" />
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/40">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-base truncate text-slate-900">
                        {conversation.type === 'PRIVATE'
                          ? userNames[conversation.participants.find((p) => p !== currentUser?.userId) || ''] || conversation.name || 'Người dùng'
                          : conversation.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                          {new Date(conversation.lastMessage.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${
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
    </Card>
  );
}
