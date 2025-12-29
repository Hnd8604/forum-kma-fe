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
      <Card className="h-full p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full p-4">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-red-500">{error}</div>
          <Button onClick={loadConversations} variant="outline">Thử lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tin nhắn</h2>
        {onCreateGroup && (
          <Button size="sm" variant="outline" onClick={onCreateGroup} className="gap-2">
            <Plus className="w-4 h-4" />
            Nhóm mới
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Chưa có cuộc hội thoại nào</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conversation.conversationId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    {conversation.type === 'GROUP' ? (
                      <Users className="w-6 h-6 text-white" />
                    ) : (
                      <MessageCircle className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {conversation.type === 'PRIVATE'
                          ? userNames[conversation.participants.find((p) => p !== currentUser?.userId) || ''] || conversation.name || 'Người dùng'
                          : conversation.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.message || 'Chưa có tin nhắn'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 bg-red-500 flex-shrink-0">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
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
