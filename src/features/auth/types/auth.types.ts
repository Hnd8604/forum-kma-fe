export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthData {
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  userId: string;
  username: string;
  email: string;
  roles?: string[];
  banned?: boolean;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
