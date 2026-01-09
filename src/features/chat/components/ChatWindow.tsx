import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatService } from '../services/chat.service';
import type { Conversation, Message, MessageType, SendMessageRequest } from '@/interfaces/chat.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Users, MessageCircle, Settings2, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useStore';
import { AuthService } from '../../auth/services/auth.service';
import GroupMembersDialog from './GroupMembersDialog';
import ChatMediaUpload from './ChatMediaUpload';
import ChatMessageContent from './ChatMessageContent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Check if should show time between messages (5+ minutes gap or different sender)
const shouldShowTime = (currentMsg: Message, prevMsg: Message | null): boolean => {
  if (!prevMsg) return true; // Always show time for first message

  const currentTime = new Date(currentMsg.createdAt).getTime();
  const prevTime = new Date(prevMsg.createdAt).getTime();
  const timeDiff = currentTime - prevTime;
  const fiveMinutes = 5 * 60 * 1000;

  // Show time if: different sender OR more than 5 minutes gap
  return currentMsg.fromUserId !== prevMsg.fromUserId || timeDiff > fiveMinutes;
};

// Check if should show date separator
const shouldShowDateSeparator = (currentMsg: Message, prevMsg: Message | null): boolean => {
  if (!prevMsg) return true; // Always show date for first message

  const currentDate = new Date(currentMsg.createdAt).toDateString();
  const prevDate = new Date(prevMsg.createdAt).toDateString();

  return currentDate !== prevDate;
};

// Format date for separator
const formatDateSeparator = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return 'Hôm nay';
  }
  if (messageDate.getTime() === yesterday.getTime()) {
    return 'Hôm qua';
  }

  // Within same week
  const daysDiff = Math.floor((today.getTime() - messageDate.getTime()) / (24 * 60 * 60 * 1000));
  if (daysDiff < 7) {
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return dayNames[date.getDay()];
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
  onConversationRead?: (conversationId: string, userId: string) => void;
}

export default function ChatWindow({ conversation, onBack, onConversationRead }: ChatWindowProps) {
  const user = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState<string>('');
  const [chatAvatar, setChatAvatar] = useState<string>(''); // Renamed/purposed for both group and user avatar
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

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
        type: data.messageType || data.type || 'TEXT',
        resourceUrls: data.resourceUrls || [],
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

  // Listen to global WebSocket events (WebSocketManager handles the connection)
  useEffect(() => {
    const wrappedHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handleWsMessage(customEvent.detail);
    };

    window.addEventListener('chat-message-received', wrappedHandler);

    // Listen for message deletion from other windows
    const handleMessageDeleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { messageId, conversationId } = customEvent.detail;
      if (conversationId === currentConversationIdRef.current) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    };
    window.addEventListener('chat-message-deleted', handleMessageDeleted);

    return () => {
      window.removeEventListener('chat-message-received', wrappedHandler);
      window.removeEventListener('chat-message-deleted', handleMessageDeleted);
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
            const name = `${u.lastName || ''} ${u.firstName || u.username || ''}`.trim() || u.username || other;
            setDisplayName(name);
            setChatAvatar(u.avatarUrl || '');
          } catch (err) {
            console.error('Failed to resolve participant name', err);
            setDisplayName('Người dùng');
            setChatAvatar('');
          }
        }
      } else if (conversation.type === 'group' && conversation.groupId) {
        try {
          const group = await ChatService.getGroupById(conversation.groupId);
          setDisplayName(group.name || 'Nhóm chat');
          setChatAvatar(group.avatarUrl || '');
        } catch (err) {
          console.error('Failed to fetch group name', err);
          setDisplayName('Nhóm chat');
          setChatAvatar('');
        }
      } else {
        setDisplayName('Nhóm chat');
        setChatAvatar('');
      }
    };

    resolveName();
  }, [conversation.conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch user names and avatars for ONLY OTHER users' messages (optimize)
    if (messages.length > 0) {
      const userIds = [...new Set(messages.map(m => m.fromUserId).filter(id => id !== user?.userId))];

      // If private chat, we might already have the info from resolveName, but good to ensure consistent map
      const missingIds = userIds.filter(id => !userNames[id] && !userAvatars[id]);

      if (missingIds.length > 0) {
        Promise.all(
          missingIds.map(async (userId) => {
            try {
              const u = await AuthService.getUserById(userId);
              const name = `${u.lastName || ''} ${u.firstName || u.username || ''}`.trim() || u.username || userId;
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
    }
  }, [messages, conversation.conversationId]);

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

  const handleSendMessage = async (messageType: MessageType = 'TEXT', resourceUrls?: string[]) => {
    const messageText = newMessage.trim();

    // For TEXT messages, require text content
    // For media messages, text is optional (caption)
    if (messageType === 'TEXT' && !messageText) return;
    if (messageType !== 'TEXT' && (!resourceUrls || resourceUrls.length === 0)) return;
    if (sending) return;

    setNewMessage('');
    setSending(true);

    // Optimistic update - add message to UI immediately
    const tempId = `temp-${Date.now()}`;
    const displayMessage = messageText || (messageType === 'IMAGE' ? '📷 Hình ảnh' : messageType === 'VIDEO' ? '🎬 Video' : '📎 Tệp đính kèm');
    const optimisticMessage: Message = {
      id: tempId,
      fromUserId: user?.userId || '',
      conversationId: conversation.conversationId,
      message: displayMessage,
      type: messageType,
      resourceUrls: resourceUrls,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Build request based on conversation type
      let request: SendMessageRequest = {
        message: displayMessage,
        type: messageType,
        resourceUrls: resourceUrls,
      };

      // Debug log for media messages
      if (messageType !== 'TEXT') {
        console.log('[ChatWindow] Sending media message:', { messageType, resourceUrls, request });
      }

      if (conversation.type === 'private') {
        // For private chat: send receiverId (the other user's ID)
        const receiverId = conversation.participantIds.find(id => id !== user?.userId);
        if (!receiverId) {
          throw new Error('Cannot find receiver ID for private conversation');
        }
        request.receiverId = receiverId;
      } else if (conversation.type === 'group') {
        // For group chat: send groupId
        if (!conversation.groupId) {
          throw new Error('Group conversation missing groupId');
        }
        request.groupId = conversation.groupId;
      }

      const sentMessage = await ChatService.sendMessage(request);

      // Replace the optimistic message with the real one from API
      setMessages((prev) =>
        prev.map(msg => msg.id === tempId ? sentMessage : msg)
      );

      // Dispatch event để các component khác biết và cập nhật (ChatDropdown, MiniChatWindow, ConversationList)
      window.dispatchEvent(new CustomEvent('chat-message-sent', {
        detail: {
          chatId: sentMessage.conversationId || conversation.conversationId,
          conversationId: sentMessage.conversationId || conversation.conversationId,
          senderId: user?.userId,
          message: displayMessage,
          sentAt: sentMessage.createdAt || new Date().toISOString(),
        }
      }));

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

  // Handle media upload
  const handleMediaUpload = (urls: string[], type: MessageType) => {
    handleSendMessage(type, urls);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const isMyMessage = (message: Message) => {
    return message.fromUserId === user?.userId;
  };

  // Handle delete message
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    setDeletingMessageId(messageToDelete);
    try {
      await ChatService.deleteMessage(messageToDelete);

      // Remove message from local state
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));

      // Dispatch event to sync with other chat windows (MiniChatWindow)
      window.dispatchEvent(new CustomEvent('chat-message-deleted', {
        detail: {
          messageId: messageToDelete,
          conversationId: conversation.conversationId,
        }
      }));

      toast.success('Đã xóa tin nhắn');
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      toast.error(err.message || 'Không thể xóa tin nhắn');
    } finally {
      setDeletingMessageId(null);
      setShowDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const confirmDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Card className="h-full flex flex-col border-0 rounded-none bg-white">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white/80 backdrop-blur-md">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 overflow-hidden">
            {chatAvatar ? (
              <img src={chatAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : conversation.type === 'group' ? (
              <Users className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white font-bold">{displayName?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">{displayName}</h2>
            {conversation.type === 'group' && (
              <p className="text-xs text-slate-500">
                {conversation.participantIds.length} thành viên
              </p>
            )}
          </div>
          {/* Group settings button */}
          {conversation.type === 'group' && conversation.groupId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMembersDialog(true)}
              className="h-9 w-9 rounded-xl hover:bg-slate-100"
              title="Quản lý thành viên"
            >
              <Settings2 className="w-5 h-5 text-slate-600" />
            </Button>
          )}
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
                {messages.map((message, index) => {
                  const isMine = isMyMessage(message);
                  const senderAvatar = userAvatars[message.fromUserId];
                  const senderName = userNames[message.fromUserId];
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

                  const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
                  const showTime = shouldShowTime(message, prevMessage);

                  // Check if this is the last message in a group (next message is from different person or has time gap)
                  const isLastInGroup = !nextMessage || shouldShowTime(nextMessage, message);

                  return (
                    <div key={message.id}>
                      {/* Date Separator */}
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-4">
                          <div className="px-4 py-1.5 bg-slate-100 rounded-full text-xs text-slate-500 font-medium">
                            {formatDateSeparator(message.createdAt)}
                          </div>
                        </div>
                      )}

                      {/* Time separator (when there's a gap but same day) */}
                      {!showDateSeparator && showTime && prevMessage && (
                        <div className="flex items-center justify-center my-3">
                          <span className="text-xs text-slate-400">
                            {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2 ${isLastInGroup ? 'mb-1' : 'mb-0.5'} group/message`}>
                        {!isMine && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold overflow-hidden shadow-sm ${!isLastInGroup ? 'invisible' : ''}`}>
                            {senderAvatar ? (
                              <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                            ) : (
                              senderName?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                        )}

                        {/* Delete button for own messages - appears on hover */}
                        {isMine && (
                          <div className="flex items-center opacity-0 group-hover/message:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full hover:bg-slate-100"
                                  disabled={deletingMessageId === message.id}
                                >
                                  {deletingMessageId === message.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                  ) : (
                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                  onClick={() => confirmDeleteMessage(message.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa tin nhắn
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          {!isMine && conversation.type === 'group' && showTime && (
                            <p className="text-xs font-semibold mb-1 text-blue-600 px-1">{senderName || 'Người dùng'}</p>
                          )}
                          <div className={`rounded-2xl px-4 py-2 shadow-sm break-words max-w-xs sm:max-w-sm md:max-w-md ${isMine
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            : 'bg-white text-slate-900 border border-slate-100'
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
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            {/* Media upload buttons */}
            <ChatMediaUpload onUpload={handleMediaUpload} disabled={sending} />

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
              onClick={() => handleSendMessage()}
              disabled={!newMessage.trim() || sending}
              className="h-11 px-5 gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Group Members Dialog */}
      {conversation.type === 'group' && conversation.groupId && (
        <GroupMembersDialog
          isOpen={showMembersDialog}
          onClose={() => setShowMembersDialog(false)}
          groupId={conversation.groupId}
          groupName={displayName}
          onMemberChange={() => {
            // Reload conversation data if needed
          }}
        />
      )}

      {/* Delete Message Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa tin nhắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
