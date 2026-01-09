// Notification types for frontend

export type NotificationType =
    | 'NEW_COMMENT'
    | 'LIKE_POST'
    | 'LIKE_COMMENT'
    | 'ADMIN'
    | 'MENTION'
    | 'NEW_POST'
    | 'NEW_CHAT_MESSAGE';

export interface Notification {
    id: string;
    senderId?: string;
    senderName?: string;
    type: NotificationType;
    title: string;
    content: string;
    referenceId?: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

export interface NotificationListResponse {
    unreadCount: number;
    data: Notification[];
}
