import { ApiService } from '../../../shared/services/api.service';
import type {
  ApiPost,
  PaginatedResponse,
  CreatePostRequest,
  UpdatePostRequest,
  PostStatus,
  PostType,
} from '../types/post.types';

export interface GetPostsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetFeedParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt,DESC' | 'reactionCount,DESC';
}

export interface GetAuthorPostsParams extends GetPostsParams {
  status?: PostStatus;
}

export interface GetGroupPostsParams extends GetFeedParams {
  status?: PostStatus;
  type?: PostType;
}

export class PostService {
  /**
   * Get all posts (paginated, with search)
   */
  static async getAllPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<ApiPost>> {
    const { page = 0, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    return ApiService.get<PaginatedResponse<ApiPost>>(`/posts?${queryParams}`, true);
  }

  /**
   * Create a new post
   */
  static async createPost(data: CreatePostRequest): Promise<ApiPost> {
    return ApiService.post<ApiPost>('/posts', data, true);
  }

  /**
   * Get post by ID
   */
  static async getPostById(postId: string): Promise<ApiPost> {
    return ApiService.get<ApiPost>(`/posts/${postId}`, true);
  }

  /**
   * Update a post
   */
  static async updatePost(postId: string, data: UpdatePostRequest): Promise<ApiPost> {
    return ApiService.put<ApiPost>(`/posts/${postId}`, data, true);
  }

  /**
   * Delete a post
   */
  static async deletePost(postId: string): Promise<void> {
    return ApiService.delete<void>(`/posts/${postId}`, true);
  }

  /**
   * Get posts by author
   */
  static async getPostsByAuthor(
    authorId: string,
    params: GetAuthorPostsParams = {}
  ): Promise<PaginatedResponse<ApiPost>> {
    const { page = 0, limit = 10, search = '', status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    if (status) queryParams.append('status', status);

    return ApiService.get<PaginatedResponse<ApiPost>>(
      `/posts/author/${authorId}?${queryParams}`,
      true
    );
  }

  /**
   * Get feed (homepage posts)
   */
  static async getFeed(params: GetFeedParams = {}): Promise<PaginatedResponse<ApiPost>> {
    const { page = 0, limit = 10, sort = 'createdAt,DESC' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    const response = await ApiService.get<PaginatedResponse<ApiPost>>(`/posts/feed?${queryParams}`, true);
    
    // Debug: Log raw response
    console.log('Raw API response:', response.content[0]);
    
    // Map userReactionType from backend to myReaction for frontend
    const mappedContent = response.content.map((post: any) => {
      console.log(`Post ${post.postId}: commentCount=${post.commentCount}, reactionCount=${post.reactionCount}`);
      return {
        ...post,
        myReaction: post.userReactionType || post.myReaction || null,
        commentCount: typeof post.commentCount === 'number' ? post.commentCount : 0,
      };
    });
    
    console.log('Mapped content:', mappedContent[0]);
    
    return {
      ...response,
      content: mappedContent,
    };
  }

  /**
   * Get feed by group
   */
  static async getFeedByGroup(
    groupId: string,
    params: GetGroupPostsParams = {}
  ): Promise<PaginatedResponse<ApiPost>> {
    const { page = 0, limit = 10, sort = 'createdAt,DESC', status, type } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });
    if (status) queryParams.append('status', status);
    if (type) queryParams.append('type', type);

    const response = await ApiService.get<PaginatedResponse<ApiPost>>(
      `/posts/feed/group/${groupId}?${queryParams}`,
      true
    );

    // Map userReactionType from backend to myReaction for frontend
    return {
      ...response,
      content: response.content.map((post: any) => ({
        ...post,
        myReaction: post.userReactionType || post.myReaction || null,
        commentCount: post.commentCount || 0,
      })),
    };
  }

  /**
   * Approve a post (Admin)
   */
  static async approvePost(postId: string): Promise<ApiPost> {
    return ApiService.put<ApiPost>(`/posts/approve/${postId}`, {}, true);
  }

  /**
   * Get pending posts (Admin)
   */
  static async getPendingPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<ApiPost>> {
    const { page = 0, limit = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return ApiService.get<PaginatedResponse<ApiPost>>(
      `/posts/admin/pending?${queryParams}`,
      true
    );
  }

  /**
   * Get group pending posts (Admin)
   */
  static async getGroupPendingPosts(
    groupId: string,
    params: { page?: number; limit?: number; type?: PostType } = {}
  ): Promise<PaginatedResponse<ApiPost>> {
    const { page = 0, limit = 10, type } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type) queryParams.append('type', type);

    return ApiService.get<PaginatedResponse<ApiPost>>(
      `/posts/admin/group/${groupId}/pending?${queryParams}`,
      true
    );
  }
}
