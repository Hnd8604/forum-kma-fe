import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import type { Conversation, Message } from '../types/chat.types';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { X, Minus, Send, Users } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';

interface MiniChatWindowProps {
  conversation: Conversation;
  onClose: () => void;
  position: number; // Position index for stacking windows
}

export default function MiniChatWindow({
  conversation,
  onClose,
  position,
}: MiniChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState<string>(conversation.name);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
    resolveName();
  }, [conversation.conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await ChatService.getMessages(conversation.conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await ChatService.markAsRead(conversation.conversationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

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
        }
      }
    } else {
      setDisplayName(conversation.name);
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
    } catch (error) {
      console.error('Failed to send message:', error);
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

  // Calculate position from right
  const rightOffset = 20 + position * 340; // 320px width + 20px gap

  return (
    <Card
      className="fixed bottom-0 w-80 shadow-2xl border-0 flex flex-col bg-white/95 backdrop-blur-md z-50 rounded-t-2xl overflow-hidden"
      style={{ right: `${rightOffset}px`, height: minimized ? 'auto' : '480px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
          {conversation.type === 'GROUP' ? (
            <Users className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white text-base font-bold">
              {displayName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate text-white">{displayName}</h3>
          <p className="text-xs text-blue-100">Đang hoạt động</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hover:bg-white/20 text-white rounded-lg"
          onClick={() => setMinimized(!minimized)}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hover:bg-white/20 text-white rounded-lg"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages - Only show when not minimized */}
      {!minimized && (
        <>
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-slate-50 to-white" ref={scrollRef as any}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p className="text-slate-400 text-sm">Chưa có tin nhắn</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isMine = isMyMessage(message);
                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                          isMine
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            : 'bg-white text-slate-900 border border-slate-200'
                        }`}
                      >
                        {!isMine && conversation.type === 'GROUP' && (
                          <p className="text-xs font-semibold mb-1 text-blue-600">
                            {message.senderId}
                          </p>
                        )}
                        <p className="text-sm break-words">{message.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Aa"
                disabled={sending}
                className="flex-1 h-10 text-sm rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
                className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
