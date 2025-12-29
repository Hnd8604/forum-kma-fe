export type MessageType = 'text' | 'image' | 'file' | 'video';
export type ConversationType = 'PRIVATE' | 'GROUP';

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  message: string;
  type: MessageType;
  isRead: boolean;
  createdAt: string;
}

export interface LastMessage {
  messageId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  type: ConversationType;
  name: string;
  participants: string[];
  lastMessage?: LastMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  groupId?: string;
  receiverId?: string;
  message: string;
  type?: MessageType;
}

export interface CreateGroupRequest {
  name: string;
  memberIds: string[];
}
