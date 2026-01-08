import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../../auth/services/auth.service';
import type { Conversation, Message, MessageType, SendMessageRequest } from '@/interfaces/chat.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useStore';
import { formatMessageTime } from '../utils/timeFormat';
import ChatMediaUpload from './ChatMediaUpload';
import ChatMessageContent from './ChatMessageContent';

// Check if should show time between messages (5+ minutes gap or different sender)
const shouldShowTime = (currentMsg: Message, prevMsg: Message | null): boolean => {
  if (!prevMsg) return true;

  const currentTime = new Date(currentMsg.createdAt).getTime();
  const prevTime = new Date(prevMsg.createdAt).getTime();
  const timeDiff = currentTime - prevTime;
  const fiveMinutes = 5 * 60 * 1000;

  return currentMsg.fromUserId !== prevMsg.fromUserId || timeDiff > fiveMinutes;
};

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
  const [displayName, setDisplayName] = useState<string>('');
  const [partnerAvatar, setPartnerAvatar] = useState<string>(''); // Avatar for private chat partner
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
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

  // Listen for real-time WebSocket messages
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const data = event.detail;
      const messageConversationId = data.chatId || data.conversationId;

      // Check if this message belongs to current conversation
      if (messageConversationId === conversation.conversationId) {
        // Don't add our own messages again (already added via setMessages after sendMessage)
        if (data.senderId === user?.userId) {
          return;
        }

        // Add new message to the list
        const newMsg: Message = {
          id: data.id || data.messageId || `ws-${Date.now()}-${Math.random()}`,
          conversationId: messageConversationId,
          fromUserId: data.senderId || data.fromUserId,
          toUserId: data.receiverId,
          message: data.message,
          type: data.messageType || data.type || 'TEXT',
          resourceUrls: data.resourceUrls || [],
          createdAt: data.sentAt || data.createdAt || new Date().toISOString(),
        };

        setMessages((prev) => {
          // Check for duplicates based on message content and time (not just ID)
          const isDuplicate = prev.some(m =>
            m.message === newMsg.message &&
            m.fromUserId === newMsg.fromUserId &&
            Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 5000
          );

          if (isDuplicate) {
            return prev;
          }

          return [...prev, newMsg];
        });

        // Mark as read since window is open
        markAsRead();
      }
    };

    window.addEventListener('chat-message-received', handleNewMessage as EventListener);

    return () => {
      window.removeEventListener('chat-message-received', handleNewMessage as EventListener);
    };
  }, [conversation.conversationId, user?.userId]);

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
      // Dispatch event to update unread counts in other components
      if (user) {
        window.dispatchEvent(new CustomEvent('conversation-marked-read', {
          detail: { conversationId: conversation.conversationId, userId: user.userId }
        }));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const resolveName = async () => {
    if (conversation.type === 'private' && user) {
      const other = conversation.participantIds.find((p) => p !== user.userId);
      if (other) {
        try {
          const u = await AuthService.getUserById(other);
          const name = `${u.firstName || u.username || ''} ${u.lastName || ''}`.trim() || u.username || other;
          setDisplayName(name);
          setPartnerAvatar(u.avatarUrl || '');
          // Also store in userNames/userAvatars for message display
          setUserNames((prev) => ({ ...prev, [other]: name }));
          setUserAvatars((prev) => ({ ...prev, [other]: u.avatarUrl || '' }));
        } catch (err) {
          console.error('Failed to resolve participant name', err);
          setDisplayName('Người dùng');
          setPartnerAvatar('');
        }
      }
    } else if (conversation.type === 'group' && conversation.groupId) {
      try {
        const group = await ChatService.getGroupById(conversation.groupId);
        setDisplayName(group.name || 'Nhóm chat');
        setPartnerAvatar(group.avatarUrl || '');
      } catch (err) {
        console.error('Failed to fetch group name', err);
        setDisplayName('Nhóm chat');
        setPartnerAvatar('');
      }
    } else {
      setDisplayName('Chat');
      setPartnerAvatar('');
    }
  };

  const handleSendMessage = async (messageType: MessageType = 'TEXT', resourceUrls?: string[]) => {
    const messageText = newMessage.trim();

    // For TEXT messages, require text content
    // For media messages, text is optional (caption)
    if (messageType === 'TEXT' && !messageText) return;
    if (messageType !== 'TEXT' && (!resourceUrls || resourceUrls.length === 0)) return;
    if (sending) return;

    setNewMessage('');
    setSending(true);

    try {
      // Build request
      let request: SendMessageRequest = {
        message: messageText || (messageType === 'IMAGE' ? '📷 Hình ảnh' : messageType === 'VIDEO' ? '🎬 Video' : '📎 Tệp đính kèm'),
        type: messageType,
        resourceUrls: resourceUrls,
      };

      if (conversation.conversationId.startsWith('temp-') && conversation.partnerId) {
        // New conversation - use partnerId
        request.receiverId = conversation.partnerId;
      } else if (conversation.type === 'private') {
        // Existing private conversation - find the other user's ID
        const receiverId = conversation.participantIds.find(id => id !== user?.userId);
        if (receiverId) {
          request.receiverId = receiverId;
        } else {
          // Fallback to conversationId if can't find receiverId
          request.conversationId = conversation.conversationId;
        }
      } else if (conversation.type === 'group' && conversation.groupId) {
        // Group conversation - use groupId
        request.groupId = conversation.groupId;
      } else {
        // Fallback
        request.conversationId = conversation.conversationId;
      }

      const sentMessage = await ChatService.sendMessage(request);
      setMessages((prev) => [...prev, sentMessage]);

      // Dispatch event để các component khác biết và cập nhật (ChatDropdown, ConversationList)
      window.dispatchEvent(new CustomEvent('chat-message-sent', {
        detail: {
          chatId: sentMessage.conversationId || conversation.conversationId,
          conversationId: sentMessage.conversationId || conversation.conversationId,
          senderId: user?.userId,
          message: request.message,
          sentAt: sentMessage.createdAt || new Date().toISOString(),
        }
      }));

      // Nếu là tạo mới, thông báo cho parent
      if (conversation.conversationId.startsWith('temp-') && sentMessage.conversationId) {
        window.dispatchEvent(new CustomEvent('conversation-created', {
          detail: {
            tempId: conversation.conversationId,
            realConversationId: sentMessage.conversationId,
          }
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Handle media upload
  const handleMediaUpload = (urls: string[], type: MessageType) => {
    handleSendMessage(type, urls);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const isMyMessage = (message: Message) => {
    return message.fromUserId === user?.userId;
  };

  // Calculate position from right
  const rightOffset = 20 + position * 340; // 320px width + 20px gap

  return (
    <Card
      className="fixed bottom-0 w-80 shadow-2xl border-0 flex flex-col bg-white/95 backdrop-blur-md z-50 rounded-t-2xl overflow-hidden"
      style={{ right: `${rightOffset}px`, height: '480px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
          {partnerAvatar ? (
            <img src={partnerAvatar} alt={displayName} className="w-full h-full object-cover" />
          ) : conversation.type === 'group' ? (
            <Users className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white text-base font-bold">
              {displayName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate text-white">{displayName}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 hover:bg-white/20 text-white rounded-lg"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 p-4 bg-slate-50 overflow-y-auto overflow-x-hidden" ref={scrollRef}>
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
          <div className="space-y-0.5">
            {messages.map((message, index) => {
              const isMine = isMyMessage(message);
              const senderAvatar = userAvatars[message.fromUserId];
              const senderName = userNames[message.fromUserId];
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

              const showTime = shouldShowTime(message, prevMessage);
              const isLastInGroup = !nextMessage || shouldShowTime(nextMessage, message);

              return (
                <div key={message.id}>
                  {/* Time separator */}
                  {showTime && prevMessage && (
                    <div className="flex items-center justify-center my-2">
                      <span className="text-[10px] text-slate-400">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2 ${isLastInGroup ? 'mb-1' : ''}`}>
                    {!isMine && (
                      <div className={`w-7 h-7 flex-shrink-0 ${isLastInGroup ? '' : 'opacity-0'}`}>
                        {isLastInGroup && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs text-white font-semibold overflow-hidden shadow-sm">
                            {senderAvatar ? (
                              <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                            ) : (
                              senderName?.charAt(0).toUpperCase() || displayName?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col max-w-[70%] min-w-0 ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && showTime && (
                        <p className="text-xs font-semibold mb-1 text-blue-600 px-1">
                          {senderName || displayName || 'Người dùng'}
                        </p>
                      )}
                      <div className={`rounded-2xl px-3 py-1.5 shadow-sm max-w-full ${isMine
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-white text-slate-900 border border-slate-200'
                        }`}>
                        <ChatMessageContent
                          message={message.message}
                          type={message.type}
                          resourceUrls={message.resourceUrls}
                          isMine={isMine}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {/* Media upload buttons */}
          <ChatMediaUpload onUpload={handleMediaUpload} disabled={sending} />

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Aa"
            disabled={sending}
            className="flex-1 h-10 text-sm rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/25"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </Card>
  );
}
