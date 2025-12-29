// Post types
export type PostStatus = 'PUBLISHED' | 'PENDING' | 'REJECTED';
export type PostType = 'TEXT' | 'IMAGE' | 'DOC';
export type ReactionType = 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
export type GroupPrivacy = 'PUBLIC' | 'PRIVATE';

// API Post interface (from backend)
export interface ApiPost {
  postId: string;
  title: string;
  content: string;
  authorId: string;
  groupId: string;
  status: PostStatus;
  type: PostType;
  resourceUrl?: string;
  reactionCount: number;
  myReaction?: ReactionType | null;
  createdAt: string;
  updatedAt?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Create post request
export interface CreatePostRequest {
  title: string;
  content: string;
  groupId?: string;
  type: PostType;
  resourceUrl?: string;
}

// Update post request
export interface UpdatePostRequest {
  title?: string;
  content?: string;
  type?: PostType;
  resourceUrl?: string;
}

// Comment types
export interface Comment {
  commentId: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
  reactionCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Interaction types
export interface Interaction {
  interactionId: string;
  userId: string;
  postId: string;
  commentId?: string;
  type: ReactionType;
  createdAt: string;
}

export interface CreateInteractionRequest {
  postId: string;
  commentId?: string;
  type: ReactionType;
}

export interface InteractionCount {
  postId: string;
  commentId?: string;
  likeCount: number;
  loveCount: number;
  hahaCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  totalCount: number;
}

// Group types
export interface Group {
  groupId: string;
  name?: string;           // For /groups endpoint
  groupName?: string;      // For /groups/my-groups endpoint
  description: string;
  privacy?: GroupPrivacy;  // For /groups endpoint
  visibility?: 'PUBLIC' | 'PRIVATE';  // For /groups/my-groups endpoint
  memberCount: number;
  createdBy?: string;
  ownerId?: string;        // For /groups/my-groups endpoint
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  privacy: GroupPrivacy;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  privacy?: GroupPrivacy;
}

export interface JoinGroupRequest {
  groupId: string;
}

// Legacy types for backward compatibility
export interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    group: string;
  };
  timeAgo: string;
  timestamp: number;
  title: string;
  content: string;
  image?: boolean;
  upvotes: number;
  comments: number;
  hasUpvoted: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  group?: string;
  image?: string;
}
