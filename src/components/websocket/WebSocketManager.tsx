import { useAuthStore } from '@/store/useStore';
import { useWebSocket } from '@/features/chat/hooks/useWebSocket';

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
 * - Dispatches events for real-time updates
 */
export default function WebSocketManager() {
    const user = useAuthStore((s) => s.user);

    const handleWebSocketMessage = (data: WebSocketMessage) => {
        // Dispatch event for own messages
        if (data.senderId === user?.userId) {
            window.dispatchEvent(new CustomEvent('chat-message-sent', { detail: data }));
            return;
        }

        // Dispatch event for received messages
        window.dispatchEvent(new CustomEvent('chat-message-received', { detail: data }));
    };

    // Initialize WebSocket connection
    useWebSocket({
        userId: user?.userId || '',
        token: localStorage.getItem('accessToken') || '',
        onMessage: handleWebSocketMessage,
        autoConnect: !!user?.userId,
    });

    return null;
}
