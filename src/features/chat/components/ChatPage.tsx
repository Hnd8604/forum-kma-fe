import { useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import CreateGroupDialog from './CreateGroupDialog';
import type { Conversation } from '../types/chat.types';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <div className={`w-full md:w-96 border-r bg-white ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <ConversationList
          key={refreshKey}
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.conversationId}
          onCreateGroup={() => setIsCreateGroupOpen(true)}
        />
      </div>

      <div className={`flex-1 ${selectedConversation ? 'block' : 'hidden md:block'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="h-full hidden md:flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-2">Chọn một cuộc hội thoại</p>
              <p className="text-sm">Hoặc tạo nhóm chat mới để bắt đầu</p>
            </div>
          </div>
        )}
      </div>

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleRefresh}
      />
    </div>
  );
}
