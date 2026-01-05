import { ApiService } from '@/api/api.service';
import endpoints from '@/api/endpoints';
import { User } from '@/interfaces/auth.types';

// Types
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface AdminPost {
  postId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  groupId?: string;
  groupName?: string;
  status: 'PENDING' | 'PUBLISHED' | 'DELETED';
  reactionCount: number;
  commentCount: number;
  type: 'TEXT' | 'IMAGE' | 'DOC';
  resourceUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminGroup {
  id: string;
  name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  memberCount: number;
  postCount: number;
  createdAt: string;
  ownerId: string;
  ownerName?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalPosts: number;
  totalGroups: number;
  totalComments: number;
  pendingReports: number;
}

export class AdminService {
  // ============= USER MANAGEMENT =============

  /**
   * Get all users with pagination
   */
  static async getAllUsers(page = 0, size = 10): Promise<PaginatedResponse<User>> {
    const response = await ApiService.get<any>(
      `${endpoints.ADMIN_ENDPOINTS.GET_ALL_USERS}?page=${page}&size=${size}`,
      true
    );
    return response.result || response;
  }

  /**
   * Search users by keyword
   */
  static async searchUsers(keyword: string, page = 0, size = 10): Promise<PaginatedResponse<User>> {
    const response = await ApiService.get<any>(
      `${endpoints.ADMIN_ENDPOINTS.SEARCH_USERS}?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
      true
    );
    return response.result || response;
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    const response = await ApiService.get<any>(
      endpoints.ADMIN_ENDPOINTS.GET_USER_BY_ID(id),
      true
    );
    return response.result || response;
  }

  /**
   * Ban user
   */
  static async banUser(userId: string): Promise<User> {
    const response = await ApiService.post<any>(
      endpoints.ADMIN_ENDPOINTS.BAN_USER(userId),
      {},
      true
    );
    return response.result || response;
  }

  /**
   * Unban user
   */
  static async unbanUser(userId: string): Promise<User> {
    const response = await ApiService.post<any>(
      endpoints.ADMIN_ENDPOINTS.UNBAN_USER(userId),
      {},
      true
    );
    return response.result || response;
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    await ApiService.delete<any>(
      endpoints.ADMIN_ENDPOINTS.DELETE_USER(userId),
      true
    );
  }

  // ============= ROLE MANAGEMENT =============

  /**
   * Get all roles
   */
  static async getAllRoles(): Promise<Role[]> {
    const response = await ApiService.get<any>(
      endpoints.ADMIN_ENDPOINTS.GET_ALL_ROLES,
      true
    );
    return response.result || response;
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: string): Promise<Role> {
    const response = await ApiService.get<any>(
      endpoints.ADMIN_ENDPOINTS.GET_ROLE_BY_ID(id),
      true
    );
    return response.result || response;
  }

  /**
   * Create new role
   */
  static async createRole(data: { name: string; permissions: string[] }): Promise<Role> {
    const response = await ApiService.post<any>(
      endpoints.ADMIN_ENDPOINTS.CREATE_ROLE,
      data,
      true
    );
    return response.result || response;
  }

  /**
   * Update role
   */
  static async updateRole(id: string, data: { name: string; permissions: string[] }): Promise<Role> {
    const response = await ApiService.put<any>(
      endpoints.ADMIN_ENDPOINTS.UPDATE_ROLE(id),
      data,
      true
    );
    return response.result || response;
  }

  /**
   * Delete role
   */
  static async deleteRole(id: string): Promise<void> {
    await ApiService.delete<any>(
      endpoints.ADMIN_ENDPOINTS.DELETE_ROLE(id),
      true
    );
  }

  // ============= POST MANAGEMENT =============

  /**
   * Get all posts with pagination and search
   */
  static async getAllPosts(page = 0, limit = 10, search = ''): Promise<PaginatedResponse<AdminPost>> {
    let url = `${endpoints.ADMIN_ENDPOINTS.GET_ALL_POSTS}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await ApiService.get<any>(url, true);
    return response.result || response;
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string): Promise<void> {
    await ApiService.delete<any>(
      endpoints.ADMIN_ENDPOINTS.DELETE_POST(postId),
      true
    );
  }

  /**
   * Get posts by group with status filter
   */
  static async getPostsByGroup(
    groupId: string,
    page = 0,
    limit = 10,
    status?: 'PENDING' | 'PUBLISHED' | 'DELETED'
  ): Promise<PaginatedResponse<AdminPost>> {
    let url = `${endpoints.ADMIN_ENDPOINTS.GET_POSTS_BY_GROUP(groupId)}?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await ApiService.get<any>(url, true);
    return response.result || response;
  }

  // ============= GROUP MANAGEMENT =============

  /**
   * Get all groups with pagination
   */
  static async getAllGroups(page = 0, size = 10): Promise<PaginatedResponse<AdminGroup>> {
    const response = await ApiService.get<any>(
      `${endpoints.ADMIN_ENDPOINTS.GET_ALL_GROUPS}?page=${page}&size=${size}`,
      true
    );
    return response.result || response;
  }

  /**
   * Get group by ID
   */
  static async getGroupById(id: string): Promise<AdminGroup> {
    const response = await ApiService.get<any>(
      endpoints.ADMIN_ENDPOINTS.GET_GROUP_BY_ID(id),
      true
    );
    return response.result || response;
  }

  /**
   * Delete group
   */
  static async deleteGroup(groupId: string): Promise<void> {
    await ApiService.delete<any>(
      endpoints.ADMIN_ENDPOINTS.DELETE_GROUP(groupId),
      true
    );
  }

  /**
   * Get group members
   */
  static async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const response = await ApiService.get<any>(
      endpoints.ADMIN_ENDPOINTS.GET_GROUP_MEMBERS(groupId),
      true
    );
    return response.result || response;
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    groupId: string,
    userId: string,
    role: 'ADMIN' | 'MEMBER'
  ): Promise<GroupMember> {
    const response = await ApiService.put<any>(
      endpoints.ADMIN_ENDPOINTS.UPDATE_MEMBER_ROLE(groupId),
      { userId, role },
      true
    );
    return response.result || response;
  }

  /**
   * Remove member from group
   */
  static async removeMember(groupId: string, userId: string): Promise<void> {
    await ApiService.delete<any>(
      endpoints.ADMIN_ENDPOINTS.REMOVE_MEMBER(groupId, userId),
      true
    );
  }

  // ============= COMMENT MANAGEMENT =============

  /**
   * Delete comment
   */
  static async deleteComment(commentId: string): Promise<void> {
    await ApiService.delete<any>(
      endpoints.ADMIN_ENDPOINTS.DELETE_COMMENT(commentId),
      true
    );
  }

  // ============= STATISTICS =============

  /**
   * Get admin dashboard statistics
   * Note: This is a placeholder - the actual endpoint may not exist yet
   */
  static async getStats(): Promise<AdminStats> {
    try {
      const response = await ApiService.get<any>(
        endpoints.ADMIN_ENDPOINTS.GET_STATS,
        true
      );
      return response.result || response;
    } catch {
      // Return mock data if endpoint doesn't exist
      return {
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        totalPosts: 0,
        totalGroups: 0,
        totalComments: 0,
        pendingReports: 0,
      };
    }
  }
}
