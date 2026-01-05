const WS_BASE_URL = 'ws://72.60.198.235:8090/ws';

type MessageHandler = (data: any) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private userId: string | null = null;
    private messageHandlers: Set<MessageHandler> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private isIntentionallyClosed = false;

    /**
     * Connect to WebSocket server
     */
    connect(userId: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.userId = userId;
        this.isIntentionallyClosed = false;

        try {
            const wsUrl = `${WS_BASE_URL}?userId=${userId}`;
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyHandlers(data);
                } catch {
                    // Invalid message format - ignore
                }
            };

            this.ws.onclose = () => {
                this.ws = null;

                // Auto-reconnect if not intentionally closed
                if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;

                    setTimeout(() => {
                        if (this.userId) {
                            this.connect(this.userId);
                        }
                    }, this.reconnectDelay);
                }
            };

            this.ws.onerror = () => {
                // Error will trigger onclose
            };
        } catch {
            // Connection failed - will retry via reconnect logic
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        this.isIntentionallyClosed = true;

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.userId = null;
        this.reconnectAttempts = 0;
    }

    /**
     * Send message through WebSocket
     */
    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    /**
     * Subscribe to WebSocket messages
     */
    subscribe(handler: MessageHandler): () => void {
        this.messageHandlers.add(handler);

        // Return unsubscribe function
        return () => {
            this.messageHandlers.delete(handler);
        };
    }

    /**
     * Notify all message handlers
     */
    private notifyHandlers(data: any) {
        this.messageHandlers.forEach(handler => {
            try {
                handler(data);
            } catch {
                // Handler error - continue with other handlers
            }
        });
    }

    /**
     * Check if WebSocket is connected
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection state
     */
    getState(): number {
        return this.ws?.readyState ?? WebSocket.CLOSED;
    }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
