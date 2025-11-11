export interface User {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
}

export interface Post {
  _id: string;
  caption?: string;
  images?: string[];
  author: User | string;
  desc?: string;
  likes: string[];
  comments?: string[];
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User | string;
  likes: string[];
  parentId?: string | null;
  targetModel: "Post" | "Lesson";
  targetId: string;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostRequest {
  caption?: string;
  desc?: string;
  images?: File[];
}

export interface CreateCommentRequest {
  text: string;
  targetId: string;
  parentId?: string | null;
}

export interface UpdatePostRequest {
  caption?: string;
  desc?: string;
  images?: string[] | File[];
}

export interface UpdateCommentRequest {
  text: string;
}

