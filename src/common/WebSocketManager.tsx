import { useAuthStore } from '@/store/useStore';
import { useWebSocket } from '@/features/chat/hooks/useWebSocket';
import { useNotificationWebSocket } from '@/features/notifications/hooks/useNotificationWebSocket';

interface WebSocketMessage {
    chatId: string;
    senderId: string;
    receiverId: string | null;
    participantIds: string[] | null;
    message: string;
    sentAt: string;
}

/**
 * WebSocketManager - Manages global WebSocket connections
 * - Auto-connects when user is authenticated
 * - Handles incoming chat messages
 * - Handles incoming notifications
 * - Dispatches events for real-time updates
 */
export default function WebSocketManager() {
    const user = useAuthStore((s) => s.user);

    // Chat message handler
    const handleChatMessage = (data: WebSocketMessage) => {
        // Dispatch event for own messages
        if (data.senderId === user?.userId) {
            window.dispatchEvent(new CustomEvent('chat-message-sent', { detail: data }));
            return;
        }

        // Dispatch event for received messages
        window.dispatchEvent(new CustomEvent('chat-message-received', { detail: data }));
    };

    // Notification handler
    const handleNotification = (data: any) => {
        // Dispatch event for new notification
        window.dispatchEvent(new CustomEvent('notification-received', { detail: data }));

        // Also update unread count
        window.dispatchEvent(new CustomEvent('notification-unread-count-changed', { detail: data }));
    };

    // Initialize Chat WebSocket connection
    useWebSocket({
        userId: user?.userId || '',
        token: localStorage.getItem('accessToken') || '',
        onMessage: handleChatMessage,
        autoConnect: !!user?.userId,
    });

    // Initialize Notification WebSocket connection
    useNotificationWebSocket({
        userId: user?.userId || '',
        onNotification: handleNotification,
        autoConnect: !!user?.userId,
    });

    return null;
}

