import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatService } from '../services/chat.service';
import type { Conversation, Message } from '../types/chat.types';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { ScrollArea } from '../../../shared/components/ui/scroll-area';
import { Send, ArrowLeft, Users, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';
import { AuthService } from '../../auth/services/auth.service';
import { useWebSocket } from '../hooks/useWebSocket';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  onConversationRead?: (conversationId: string, userId: string) => void;
}

export default function ChatWindow({ conversation, onBack, onConversationRead }: ChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const token = localStorage.getItem('accessToken') || '';
  const [displayName, setDisplayName] = useState<string>('');
  const [groupAvatar, setGroupAvatar] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use ref to track current conversation ID to avoid stale closure
  const currentConversationIdRef = useRef(conversation.conversationId);

  // Update ref when conversation changes
  useEffect(() => {
    currentConversationIdRef.current = conversation.conversationId;
  }, [conversation.conversationId]);

  // WebSocket message handler - memoized to prevent reconnections
  const handleWsMessage = useCallback((data: any) => {
    const currentConvId = currentConversationIdRef.current;

    // Handle incoming messages - check against current conversation
    if ((data.type === 'MESSAGE' || !data.type) && (data.conversationId === currentConvId || data.chatId === currentConvId)) {
      const newMsg: Message = {
        id: data.id || data.messageId || `msg-${Date.now()}`,
        fromUserId: data.fromUserId || data.senderId,
        conversationId: data.conversationId || data.chatId,
        message: data.message || data.text,
        type: data.messageType || 'TEXT',
        createdAt: data.createdAt || data.sentAt || new Date().toISOString(),
      };
      setMessages((prev) => {
        // Prevent duplicates - check if message with same id already exists
        const exists = prev.some(m => m.id === newMsg.id);
        if (exists) {
          return prev;
        }
        return [...prev, newMsg];
      });
    }
  }, []); // Empty deps - uses ref for current value

  const handleWsError = useCallback((error: Event) => {
    console.error('❌ WebSocket error in ChatWindow:', error);
  }, []);

  // Listen to global WebSocket events (WebSocketManager handles the connection)
  useEffect(() => {
    const wrappedHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handleWsMessage(customEvent.detail);
    };

    window.addEventListener('chat-message-received', wrappedHandler);

    return () => {
      window.removeEventListener('chat-message-received', wrappedHandler);
    };
  }, [handleWsMessage]);

  useEffect(() => {
    // Clear messages from previous conversation first
    setMessages([]);
    loadMessages();
    markAsRead();
  }, [conversation.conversationId]);

  // Automatically mark as read when receiving new messages while viewing
  useEffect(() => {
    if (messages.length > 0 && user) {
      markAsRead();
    }
  }, [messages.length]);

  useEffect(() => {
    const resolveName = async () => {
      if (conversation.type === 'private' && user) {
        const other = conversation.participantIds.find((p) => p !== user.userId);
        if (other) {
          try {
            const u = await AuthService.getUserById(other);
            const name = `${u.firstName || u.username || ''} ${u.lastName || ''}`.trim() || u.username || other;
            setDisplayName(name);
          } catch (err) {
            console.error('Failed to resolve participant name', err);
            setDisplayName('Người dùng');
          }
        }
      } else if (conversation.type === 'group' && conversation.groupId) {
        try {
          const group = await ChatService.getGroupById(conversation.groupId);
          setDisplayName(group.name || 'Nhóm chat');
          setGroupAvatar(group.avatarUrl || '');
        } catch (err) {
          console.error('Failed to fetch group name', err);
          setDisplayName('Nhóm chat');
          setGroupAvatar('');
        }
      } else {
        setDisplayName('Nhóm chat');
        setGroupAvatar('');
      }
    };

    resolveName();
  }, [conversation.conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch user names and avatars for group chat messages
    if (conversation.type === 'group' && messages.length > 0) {
      const userIds = [...new Set(messages.map(m => m.fromUserId).filter(id => id !== user?.userId))];

      Promise.all(
        userIds.map(async (userId) => {
          if (userNames[userId]) return null;
          try {
            const u = await AuthService.getUserById(userId);
            const name = `${u.firstName || u.username || ''} ${u.lastName || ''}`.trim() || u.username || userId;
            return { userId, name, avatarUrl: u.avatarUrl || '' };
          } catch (err) {
            console.error('Failed to fetch user', userId, err);
            return { userId, name: 'Người dùng', avatarUrl: '' };
          }
        })
      ).then((results) => {
        const newNames: Record<string, string> = {};
        const newAvatars: Record<string, string> = {};
        results.forEach((r) => {
          if (r) {
            newNames[r.userId] = r.name;
            newAvatars[r.userId] = r.avatarUrl;
          }
        });
        setUserNames((prev) => ({ ...prev, ...newNames }));
        setUserAvatars((prev) => ({ ...prev, ...newAvatars }));
      });
    }
  }, [messages, conversation.type]);

  // Debug: Log messages state
  useEffect(() => {
    console.log('🗨️ [ChatWindow] Messages state updated, count:', messages.length);
    console.log('📋 [ChatWindow] Messages:', messages);
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
      // Notify parent component to update conversation list
      if (user && onConversationRead) {
        onConversationRead(conversation.conversationId, user.userId);
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Optimistic update - add message to UI immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      fromUserId: user?.userId || '',
      conversationId: conversation.conversationId,
      message: messageText,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Always send via HTTP API so backend can save and broadcast via WebSocket
      console.log('📤 Sending message via API...');

      // Build request based on conversation type
      let request: any = {
        message: messageText,
        type: 'TEXT',
      };

      if (conversation.type === 'private') {
        // For private chat: send receiverId (the other user's ID)
        const receiverId = conversation.participantIds.find(id => id !== user?.userId);
        if (!receiverId) {
          throw new Error('Cannot find receiver ID for private conversation');
        }
        request.receiverId = receiverId;
        console.log('📤 Sending private message to:', receiverId);
      } else if (conversation.type === 'group') {
        // For group chat: send groupId
        if (!conversation.groupId) {
          throw new Error('Group conversation missing groupId');
        }
        request.groupId = conversation.groupId;
        console.log('📤 Sending group message to:', conversation.groupId);
      }

      const sentMessage = await ChatService.sendMessage(request);

      console.log('✅ Message sent successfully, waiting for WebSocket broadcast...');

      // Replace the optimistic message with the real one from API
      setMessages((prev) =>
        prev.map(msg => msg.id === tempId ? sentMessage : msg)
      );

      // Backend will broadcast this message via WebSocket to all users
      // including the sender, so we'll receive it via onMessage callback

      setError(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Không thể gửi tin nhắn');
      setNewMessage(messageText);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isMyMessage = (message: Message) => {
    return message.fromUserId === user?.userId;
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-none bg-white">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white/80 backdrop-blur-md">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 overflow-hidden">
          {groupAvatar && conversation.type === 'group' ? (
            <img src={groupAvatar} alt="Group avatar" className="w-full h-full object-cover" />
          ) : conversation.type === 'group' ? (
            <Users className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white font-bold">{displayName?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">{displayName}</h2>
          <p className="text-xs text-slate-500">
            {conversation.type === 'group'
              ? `${conversation.participantIds.length} thành viên`
              : '🟢 Đang hoạt động'}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-slate-50 to-white overflow-y-auto">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-slate-500 text-sm">Đang tải tin nhắn...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="text-red-500">{error}</div>
              <Button onClick={loadMessages} variant="outline" size="sm" className="rounded-xl">Thử lại</Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-slate-500">Chưa có tin nhắn nào</p>
                <p className="text-xs text-slate-400 mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isMine = isMyMessage(message);
                const senderAvatar = userAvatars[message.fromUserId];
                const senderName = userNames[message.fromUserId];
                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}>
                    {!isMine && conversation.type === 'group' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold overflow-hidden shadow-sm">
                        {senderAvatar ? (
                          <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                        ) : (
                          senderName?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && conversation.type === 'group' && (
                        <p className="text-xs font-semibold mb-1 text-blue-600 px-1">{senderName || 'Người dùng'}</p>
                      )}
                      <div className={`rounded-2xl px-4 py-3 shadow-sm break-words ${isMine
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-white text-slate-900 border border-slate-100'
                        }`}>
                        <p className="text-sm">{message.message}</p>
                      </div>
                      <p className={`text-xs mt-1 px-1 ${isMine ? 'text-slate-400' : 'text-slate-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nhập tin nhắn..."
            disabled={sending}
            className="flex-1 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="h-11 px-5 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
