import { useEffect } from 'react';
import { useChatConversations } from '../hooks/useChatConversations';
import MiniChatWindow from './MiniChatWindow';
import FriendsList from './FriendsList';

interface ChatContainerProps {
    showFriendsList?: boolean;
}

export default function ChatContainer({ showFriendsList = false }: ChatContainerProps) {
    console.log('🎨 ChatContainer rendered, showFriendsList:', showFriendsList);
    const { openConversations, startChatWithUser, closeConversation, updateConversation } = useChatConversations();

    // Listen for conversation creation events
    useEffect(() => {
        const handleConversationCreated = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { tempId, realConversationId } = customEvent.detail;

            // Fetch the real conversation from backend
            try {
                const { ChatService } = await import('../services/chat.service');
                const conversations = await ChatService.getConversations();
                const realConv = conversations.find(c => c.conversationId === realConversationId);

                if (realConv) {
                    updateConversation(tempId, realConv);
                }
            } catch (error) {
                console.error('Failed to update conversation:', error);
            }
        };

        window.addEventListener('conversation-created', handleConversationCreated);

        return () => {
            window.removeEventListener('conversation-created', handleConversationCreated);
        };
    }, [updateConversation]);

    // Listen for chat requests from profile pages
    useEffect(() => {
        const handleStartChat = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('🎯 start-chat event received:', customEvent.detail);
            const { userId, userName, userAvatar } = customEvent.detail;
            startChatWithUser(userId, userName, userAvatar);
        };

        console.log('✅ ChatContainer mounted - listening for start-chat events');
        window.addEventListener('start-chat', handleStartChat);

        return () => {
            console.log('❌ ChatContainer unmounted - removing start-chat listener');
            window.removeEventListener('start-chat', handleStartChat);
        };
    }, [startChatWithUser]);

    return (
        <>
            {/* Friends List - Fixed on right side */}
            {showFriendsList && (
                <div className="fixed right-4 bottom-0 w-80 h-[600px] z-40">
                    <FriendsList onStartChat={startChatWithUser} />
                </div>
            )}

            {/* Chat Windows - Stacked from right */}
            {openConversations.map((conversation, index) => (
                <MiniChatWindow
                    key={conversation.conversationId}
                    conversation={conversation}
                    onClose={() => closeConversation(conversation.conversationId)}
                    position={index + (showFriendsList ? 1 : 0)} // Offset if friends list is shown
                />
            ))}
        </>
    );
}
