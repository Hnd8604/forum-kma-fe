import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chat.service';
import type { Conversation, Message } from '../types/chat.types';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Send, ArrowLeft, Users } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';
import { AuthService } from '../../auth/services/auth.service';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState<string>(conversation.name);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [conversation.conversationId]);

  useEffect(() => {
    const resolveName = async () => {
      if (conversation.type === 'PRIVATE' && user) {
        const other = conversation.participants.find((p) => p !== user.userId);
        if (other) {
          try {
            const u = await AuthService.getUserById(other);
            const name = `${u.firstName || u.username || ''} ${u.lastName || ''}`.trim() || u.username || other;
            setDisplayName(name);
          } catch (err) {
            console.error('Failed to resolve participant name', err);
            setDisplayName(conversation.name || 'Người dùng');
          }
        }
      } else {
        setDisplayName(conversation.name);
      }
    };

    resolveName();
  }, [conversation.conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ChatService.getMessages(conversation.conversationId);
      setMessages(data);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await ChatService.markAsRead(conversation.conversationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const sentMessage = await ChatService.sendMessage({
        conversationId: conversation.conversationId,
        message: messageText,
        type: 'text',
      });
      setMessages((prev) => [...prev, sentMessage]);
      setError(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Không thể gửi tin nhắn');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const isMyMessage = (message: Message) => {
    return message.senderId === user?.userId;
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          {conversation.type === 'GROUP' ? (
            <Users className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white font-semibold">{displayName?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{displayName}</h2>
          <p className="text-xs text-gray-500">
            {conversation.type === 'GROUP'
              ? `${conversation.participants.length} thành viên`
              : 'Đang hoạt động'}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Đang tải tin nhắn...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-red-500">{error}</div>
            <Button onClick={loadMessages} variant="outline" size="sm">Thử lại</Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Chưa có tin nhắn nào</div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isMine = isMyMessage(message);
              return (
                <div key={message.messageId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isMine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {!isMine && conversation.type === 'GROUP' && (
                      <p className="text-xs font-semibold mb-1 opacity-70">{message.senderId}</p>
                    )}
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nhập tin nhắn..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
