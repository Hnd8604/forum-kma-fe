// Post types
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
