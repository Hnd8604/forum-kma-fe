import { useEffect } from 'react';
import { useAuthStore } from '../../../store/useStore';
import { useWebSocket } from '../../../features/chat/hooks/useWebSocket';
import { useToast } from '../../components/ui/use-toast';

interface WebSocketMessage {
    chatId: string;
    senderId: string;
    receiverId: string | null;
    participantIds: string[] | null;
    message: string;
    sentAt: string;
}

/**
 * WebSocketManager - Manages global WebSocket connection
 * - Auto-connects when user is authenticated
 * - Handles incoming chat messages
 * - Shows notifications for new messages
 * - Dispatches events for real-time updates
 */
export default function WebSocketManager() {
    const user = useAuthStore((s) => s.user);
    const { toast } = useToast();

    const handleWebSocketMessage = (data: WebSocketMessage) => {
        console.log('📨 WebSocket message received:', data);

        // Don't show notification for own messages
        if (data.senderId === user?.userId) {
            // Just dispatch event for UI update
            window.dispatchEvent(new CustomEvent('chat-message-sent', { detail: data }));
            return;
        }

        // Show notification for new message
        const isGroupChat = data.participantIds && data.participantIds.length > 0;
        const notificationTitle = isGroupChat ? '💬 New Group Message' : '💬 New Message';

        toast({
            title: notificationTitle,
            description: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
            duration: 5000,
        });

        // Dispatch event for chat components to update
        window.dispatchEvent(new CustomEvent('chat-message-received', { detail: data }));
    };

    // Initialize WebSocket connection
    useWebSocket({
        userId: user?.userId || '',
        token: localStorage.getItem('accessToken') || '',
        onMessage: handleWebSocketMessage,
        onOpen: () => {
            console.log('🟢 WebSocket connected for user:', user?.userId);
        },
        onClose: () => {
            console.log('🔴 WebSocket disconnected');
        },
        onError: (error) => {
            console.error('⚠️ WebSocket error:', error);
        },
        autoConnect: !!user?.userId,
    });

    // This component doesn't render anything
    return null;
}
