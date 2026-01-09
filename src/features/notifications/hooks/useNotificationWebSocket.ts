import { useEffect, useRef, useCallback } from 'react';

interface UseNotificationWebSocketOptions {
    userId: string;
    onNotification: (data: any) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
    onClose?: () => void;
    autoConnect?: boolean;
}

/**
 * Hook to manage WebSocket connection for real-time notifications
 */
export function useNotificationWebSocket({
    userId,
    onNotification,
    onError,
    onOpen,
    onClose,
    autoConnect = true,
}: UseNotificationWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    // Get WebSocket URL for notification service (port 8083)
    const getWsUrl = useCallback(() => {
        const wsBase = import.meta.env.VITE_NOTIFICATION_WS_URL || 'ws://72.60.198.235:8083';
        return `${wsBase}/ws?userId=${userId}`;
    }, [userId]);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            const ws = new WebSocket(getWsUrl());

            ws.onopen = () => {
                console.log('[NotificationWS] Connected');
                onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('[NotificationWS] Received:', data);
                    onNotification(data);
                } catch (err) {
                    console.error('[NotificationWS] Failed to parse message:', event.data);
                }
            };

            ws.onerror = (error) => {
                console.error('[NotificationWS] Error:', error);
                onError?.(error);
            };

            ws.onclose = () => {
                console.log('[NotificationWS] Disconnected');
                wsRef.current = null;
                onClose?.();

                // Auto-reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (userId) {
                        connect();
                    }
                }, 5000);
            };

            wsRef.current = ws;
        } catch (err) {
            console.error('[NotificationWS] Connection error:', err);
            onError?.(err as any);
        }
    }, [userId, getWsUrl, onNotification, onError, onOpen, onClose]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect && userId) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, userId, connect, disconnect]);

    return {
        ws: wsRef.current,
        connect,
        disconnect,
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    };
}
