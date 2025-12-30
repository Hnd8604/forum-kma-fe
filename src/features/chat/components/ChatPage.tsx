import { useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import CreateGroupDialog from './CreateGroupDialog';
import NewMessageDialog from './NewMessageDialog';
import type { Conversation } from '../types/chat.types';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
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

  return (
    <div className="h-full flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className={`w-full md:w-[400px] border-r border-white/60 bg-white/95 backdrop-blur-md shadow-xl ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <ConversationList
          key={refreshKey}
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.conversationId}
          onCreateGroup={() => setIsCreateGroupOpen(true)}
          onNewMessage={() => setIsNewMessageOpen(true)}
        />
      </div>

      <div className={`flex-1 ${selectedConversation ? 'block' : 'hidden md:block'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="h-full hidden md:flex items-center justify-center">
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
