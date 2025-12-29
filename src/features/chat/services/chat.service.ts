import { ApiService } from '../../../shared/services/api.service';
import type {
  Message,
  Conversation,
  SendMessageRequest,
  CreateGroupRequest,
} from '../types/chat.types';

const CHAT_SERVICE_BASE = '/chat';

export class ChatService {
  /**
   * Gửi tin nhắn (private chat hoặc group chat)
   */
  static async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await ApiService.post<any>(
      `${CHAT_SERVICE_BASE}/send`,
      request,
      true
    );
    return response;
  }

  /**
   * Lấy danh sách cuộc hội thoại
   */
  static async getConversations(): Promise<Conversation[]> {
    const response = await ApiService.get<Conversation[]>(
      `${CHAT_SERVICE_BASE}/conversations`,
      true
    );
    return response;
  }

  /**
   * Lấy lịch sử tin nhắn
   */
  static async getMessages(conversationId: string): Promise<Message[]> {
    const response = await ApiService.get<Message[]>(
      `${CHAT_SERVICE_BASE}/messages?conversationId=${conversationId}`,
      true
    );
    return response;
  }

  /**
   * Đánh dấu đã đọc
   */
  static async markAsRead(conversationId: string): Promise<void> {
    await ApiService.post<any>(
      `${CHAT_SERVICE_BASE}/conversations/${conversationId}/mark-as-read`,
      {},
      true
    );
  }

  /**
   * Tạo nhóm chat
   */
  static async createGroup(request: CreateGroupRequest): Promise<Conversation> {
    const response = await ApiService.post<Conversation>(
      `${CHAT_SERVICE_BASE}/groups`,
      request,
      true
    );
    return response;
  }
}
