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
            console.log('WebSocket already connected');
            return;
        }

        this.userId = userId;
        this.isIntentionallyClosed = false;

        try {
            const wsUrl = `${WS_BASE_URL}?userId=${userId}`;
            console.log('🔌 Connecting to WebSocket:', wsUrl);

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('🟢 WebSocket Connected!');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                console.log('📨 WebSocket Message:', event.data);

                try {
                    const data = JSON.parse(event.data);
                    this.notifyHandlers(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log('🔴 WebSocket Closed', event.code, event.reason);
                this.ws = null;

                // Auto-reconnect if not intentionally closed
                if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

                    setTimeout(() => {
                        if (this.userId) {
                            this.connect(this.userId);
                        }
                    }, this.reconnectDelay);
                }
            };

            this.ws.onerror = (error) => {
                console.error('⚠️ WebSocket Error:', error);
            };
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
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
        console.log('WebSocket disconnected');
    }

    /**
     * Send message through WebSocket
     */
    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
            console.log('📤 Sent WebSocket message:', data);
        } else {
            console.error('WebSocket is not connected');
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
            } catch (error) {
                console.error('Error in message handler:', error);
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
