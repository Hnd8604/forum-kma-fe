import { ApiService } from '@/api/api.service';
import type {
  Message,
  Conversation,
  SendMessageRequest,
  CreateGroupRequest,
  CreateGroupResponse,
} from '@/interfaces/chat.types';

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
    const response = await ApiService.get<any[]>(
      `${CHAT_SERVICE_BASE}/conversations`,
      true
    );

    // Transform response to ensure correct field mapping
    return (response || []).map((conv: any) => ({
      conversationId: conv.conversationId || conv.id,
      type: conv.type || 'private',
      participantIds: conv.participantIds || [],
      groupId: conv.groupId || null,
      partnerId: conv.partnerId || null,
      lastMessage: conv.lastMessage || null,
      lastMessageAt: conv.lastMessageAt || null,
      unreadCounts: conv.unreadCounts || {},
    }));
  }

  /**
   * Lấy thông tin một cuộc hội thoại theo ID
   */
  static async getConversationById(conversationId: string): Promise<Conversation> {
    const conversations = await this.getConversations();
    const conversation = conversations.find(c => c.conversationId === conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return conversation;
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
    const response = await ApiService.post<CreateGroupResponse>(
      `${CHAT_SERVICE_BASE}/groups`,
      request,
      true
    );

    // Convert CreateGroupResponse to Conversation format
    return {
      conversationId: response.conversationId,
      type: 'group',
      participantIds: response.participantIds || response.memberIds || [],
      groupId: response.groupId,
      lastMessage: response.lastMessage || null,
      lastMessageAt: response.lastMessageAt || null,
      unreadCounts: {},
    };
  }

  /**
   * Lấy thông tin nhóm theo ID
   */
  static async getGroupById(groupId: string): Promise<any> {
    const response = await ApiService.get<any>(
      `${CHAT_SERVICE_BASE}/groups/${groupId}`,
      true
    );
    return response;
  }

  /**
   * Lấy danh sách thành viên nhóm
   */
  static async getGroupMembers(groupId: string): Promise<any[]> {
    const response = await ApiService.get<any[]>(
      `${CHAT_SERVICE_BASE}/groups/${groupId}/members`,
      true
    );
    return response;
  }

  /**
   * Thêm thành viên vào nhóm
   */
  static async addGroupMembers(groupId: string, userIds: string[]): Promise<any> {
    const response = await ApiService.post<any>(
      `${CHAT_SERVICE_BASE}/groups/members/add`,
      { groupId, userIds },
      true
    );
    return response;
  }

  /**
   * Xóa thành viên khỏi nhóm
   */
  static async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await ApiService.delete<void>(
      `${CHAT_SERVICE_BASE}/groups/${groupId}/members/${userId}`,
      true
    );
  }

  /**
   * Rời khỏi nhóm
   */
  static async leaveGroup(groupId: string): Promise<void> {
    await ApiService.post<void>(
      `${CHAT_SERVICE_BASE}/groups/${groupId}/leave`,
      {},
      true
    );
  }
}
