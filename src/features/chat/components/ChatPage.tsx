import { useState, useCallback, useEffect } from 'react';
import ConversationList, { AI_CONVERSATION_ID } from './ConversationList';
import ChatWindow from './ChatWindow';
import AIChatWindow from './AIChatWindow';
import CreateGroupDialog from './CreateGroupDialog';
import NewMessageDialog from './NewMessageDialog';
import type { Conversation } from '../types/chat.types';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleConversationCreated = (conversationId: string) => {
    handleRefresh();
    // Optionally select the new conversation
    // You might want to fetch and select it here
  };

  // Callback when conversation is marked as read
  const handleConversationRead = useCallback((conversationId: string, userId: string) => {
    // Dispatch event for ConversationList to update unread count
    window.dispatchEvent(new CustomEvent('conversation-marked-read', {
      detail: { conversationId, userId }
    }));
  }, []);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    if (conversation.conversationId === AI_CONVERSATION_ID) {
      setShowAIChat(true);
      setSelectedConversation(null);
    } else {
      setShowAIChat(false);
      setSelectedConversation(conversation);
    }
  }, []);

  // Listen for conversation updates from ConversationList
  useEffect(() => {
    const handleConversationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const updated = customEvent.detail as Conversation;

      setSelectedConversation(prev => {
        if (!prev) return prev;

        // If conversationId changed, update it
        if (prev.conversationId !== updated.conversationId) {
          return updated;
        }

        // Same conversationId - don't update to prevent remount
        return prev;
      });
    };

    window.addEventListener('conversation-updated', handleConversationUpdate as EventListener);

    return () => {
      window.removeEventListener('conversation-updated', handleConversationUpdate as EventListener);
    };
  }, []);

  return (
    <div className="h-full flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-[400px] border-r border-white/60 bg-white/95 backdrop-blur-md shadow-xl flex-shrink-0">
        <ConversationList
          key={refreshKey}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={showAIChat ? AI_CONVERSATION_ID : selectedConversation?.conversationId}
          onCreateGroup={() => setIsCreateGroupOpen(true)}
          onNewMessage={() => setIsNewMessageOpen(true)}
        />
      </div>

      <div className="flex-1">
        {showAIChat ? (
          <AIChatWindow onBack={() => setShowAIChat(false)} />
        ) : selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onConversationRead={handleConversationRead}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-transform">
                <span className="text-5xl">💬</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Chọn một cuộc hội thoại</p>
              <p className="text-sm text-slate-500">Hoặc tạo nhóm chat mới để bắt đầu trò chuyện</p>
            </div>
          </div>
        )}
      </div>

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleRefresh}
      />

      <NewMessageDialog
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
