import { ApiService } from '../../../shared/services/api.service';
import { LoginRequest, RegisterRequest, AuthData, User, RefreshTokenRequest, RefreshTokenResponse } from '../types/auth.types';

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginRequest): Promise<AuthData> {
    const response = await ApiService.post<AuthData>('/auth/login', credentials);
    
    // Store tokens and user data
    if (response.accessToken) {
      try {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Store user data
        const user: User = {
          userId: response.userId,
          username: response.username,
          email: response.email,
        };
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to store auth data:', error);
      }
    }
    
    return response;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<AuthData> {
    const response = await ApiService.post<AuthData>('/auth/register', userData);
    
    // Store tokens and user data
    if (response.accessToken) {
      try {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Store user data
        const user: User = {
          userId: response.userId,
          username: response.username,
          email: response.email,
        };
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to store auth data:', error);
      }
    }
    
    return response;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await ApiService.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    // Update stored tokens
    if (response.accessToken) {
      try {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      } catch (error) {
        console.error('Failed to update tokens:', error);
      }
    }

    return response;
  }

  /**
   * Get current user info from API
   */
  static async getCurrentUserFromApi(): Promise<User> {
    return ApiService.get<User>('/users/me', true);
  }

  /**
   * Logout user
   */
  static logout(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem('accessToken');
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch {
      return null;
    }
  }
}
