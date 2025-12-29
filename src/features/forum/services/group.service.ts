import { ApiService } from '../../../shared/services/api.service';
import type {
  Group,
  PaginatedResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  JoinGroupRequest,
} from '../types/post.types';

export interface GetGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export class GroupService {
  /**
   * Create a new group
   */
  static async createGroup(data: CreateGroupRequest): Promise<Group> {
    return ApiService.post<Group>('/groups', data, true);
  }

  /**
   * Get all groups (paginated, with search)
   */
  static async getAllGroups(params: GetGroupsParams = {}): Promise<PaginatedResponse<Group>> {
    const { page = 0, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    return ApiService.get<PaginatedResponse<Group>>(`/groups?${queryParams}`, true);
  }

  /**
   * Get group by ID
   */
  static async getGroupById(groupId: string): Promise<Group> {
    return ApiService.get<Group>(`/groups/${groupId}`, true);
  }

  /**
   * Update a group
   */
  static async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    return ApiService.put<Group>(`/groups/${groupId}`, data, true);
  }

  /**
   * Delete a group
   */
  static async deleteGroup(groupId: string): Promise<void> {
    return ApiService.delete<void>(`/groups/${groupId}`, true);
  }

  /**
   * Join a group
   */
  static async joinGroup(data: JoinGroupRequest): Promise<{ groupId: string; userId: string; joinedAt: string }> {
    return ApiService.post<{ groupId: string; userId: string; joinedAt: string }>('/groups/join', data, true);
  }

  /**
   * Get groups that the current user has joined
   */
  static async getMyGroups(params: GetGroupsParams = {}): Promise<Group[]> {
    const { page = 0, limit = 50, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    // /groups/my-groups returns array directly, not paginated response
    try {
      const groups = await ApiService.get<Group[]>(`/groups/my-groups?${queryParams}`, true);
      return groups || [];
    } catch (error: any) {
      // If endpoint doesn't exist (404), fallback to getAllGroups
      if (error.statusCode === 404) {
        console.warn('Endpoint /groups/my-groups not found, using /groups instead');
        const paginatedResponse = await this.getAllGroups(params);
        return paginatedResponse.content;
      }
      throw error;
    }
  }
}
