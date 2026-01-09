import { ApiService } from '@/api/api.service';
import type { Notification, NotificationListResponse } from '@/interfaces/notification.types';

const NOTIFICATION_SERVICE_BASE = '/notifications';

export class NotificationService {
    /**
     * Lấy danh sách thông báo của user hiện tại
     */
    static async getNotifications(userId: string): Promise<NotificationListResponse> {
        const response = await ApiService.get<NotificationListResponse>(
            `${NOTIFICATION_SERVICE_BASE}?userId=${userId}`,
            true
        );
        return response;
    }

    /**
     * Đánh dấu một thông báo đã đọc
     */
    static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
        const response = await ApiService.put<Notification>(
            `${NOTIFICATION_SERVICE_BASE}/${notificationId}/read?userId=${userId}`,
            {},
            true
        );
        return response;
    }

    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    static async markAllAsRead(userId: string): Promise<number> {
        const response = await ApiService.put<number>(
            `${NOTIFICATION_SERVICE_BASE}/read-all?userId=${userId}`,
            {},
            true
        );
        return response;
    }

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    static async getUnreadCount(userId: string): Promise<number> {
        const response = await ApiService.get<number>(
            `${NOTIFICATION_SERVICE_BASE}/unread-count?userId=${userId}`,
            true
        );
        return response;
    }
}
