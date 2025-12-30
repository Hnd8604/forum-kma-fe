import { ApiService } from '../../../shared/services/api.service';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../types/post.types';

export interface GetCommentsParams {
  postId: string;
  page?: number;
  size?: number;
}

export class CommentService {
  /**
   * Get comments by post ID (top-level comments only)
   */
  static async getCommentsByPost(params: GetCommentsParams): Promise<Comment[]> {
    const { postId, page = 0, size = 10 } = params;
    const queryParams = new URLSearchParams({
      postId,
      page: page.toString(),
      size: size.toString(),
    });

    return ApiService.get<Comment[]>(`/comments/post?${queryParams}`, true);
  }

  /**
   * Get replies for a specific comment
   */
  static async getRepliesByCommentId(commentId: string): Promise<Comment[]> {
    return ApiService.get<Comment[]>(`/comments/${commentId}/replies`, true);
  }

  /**
   * Create a new comment or reply
   */
  static async createComment(data: CreateCommentRequest): Promise<Comment> {
    return ApiService.post<Comment>('/comments', data, true);
  }

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    return ApiService.put<Comment>(`/comments/${commentId}`, data, true);
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<void> {
    return ApiService.delete<void>(`/comments/${commentId}`, true);
  }
}
