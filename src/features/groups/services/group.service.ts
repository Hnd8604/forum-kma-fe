import { ApiService } from '@/api/api.service';
import {
  Group,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupMemberCheckResponse,
  GroupMemberResponse,
  PageResponse,
} from '@/interfaces/group.types';

export class GroupService {
  /**
   * Create a new group
   */
  static async createGroup(request: CreateGroupRequest): Promise<Group> {
    return ApiService.post<Group>('/groups', request, true);
  }

  /**
   * Get all groups with pagination and search
   */
  static async getAllGroups(
    page: number = 0,
    limit: number = 10,
    search: string = ''
  ): Promise<PageResponse<Group>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    return ApiService.get<PageResponse<Group>>(`/groups?${params}`, true);
  }

  /**
   * Get group by ID
   */
  static async getGroupById(groupId: string): Promise<Group> {
    return ApiService.get<Group>(`/groups/${groupId}`, true);
  }

  /**
   * Update group information
   */
  static async updateGroup(
    groupId: string,
    request: UpdateGroupRequest
  ): Promise<Group> {
    return ApiService.put<Group>(`/groups/${groupId}`, request, true);
  }

  /**
   * Delete group
   */
  static async deleteGroup(groupId: string): Promise<void> {
    return ApiService.delete<void>(`/groups/${groupId}`, true);
  }

  /**
   * Join a group
   */
  static async joinGroup(groupId: string): Promise<void> {
    return ApiService.post<void>('/groups/join', { groupId }, true);
  }

  /**
   * Leave a group
   */
  static async leaveGroup(groupId: string): Promise<void> {
    return ApiService.post<void>(`/groups/${groupId}/leave`, {}, true);
  }

  /**
   * Get groups that current user is member of
   */
  static async getMyGroups(): Promise<Group[]> {
    return ApiService.get<Group[]>('/groups/my-groups', true);
  }

  /**
   * Get all members of a group
   */
  static async getGroupMembers(
    groupId: string,
    page: number = 0,
    limit: number = 20
  ): Promise<PageResponse<GroupMemberResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return ApiService.get<PageResponse<GroupMemberResponse>>(
      `/groups/${groupId}/members?${params}`,
      true
    );
  }

  /**
   * Check current user's membership status in a group
   */
  static async checkMembership(groupId: string): Promise<GroupMemberCheckResponse> {
    return ApiService.get<GroupMemberCheckResponse>(
      `/groups/${groupId}/membership`,
      true
    );
  }
}
