import { ApiService } from '../../../shared/services/api.service';
import { LoginRequest, RegisterRequest, AuthData, User, RefreshTokenRequest, RefreshTokenResponse, UpdateProfileRequest } from '../types/auth.types';

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginRequest): Promise<AuthData | any> {
    const response = await ApiService.post<any>('/auth/login', credentials);
    
    console.log('🔐 Login response:', response);
    
    // Chỉ store tokens khi có accessToken (không cần 2FA hoặc đã verify OTP)
    if (response.accessToken) {
      try {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        console.log('✅ Token saved to localStorage:', response.accessToken.substring(0, 20) + '...');
        
        // Store user data
        const user: User = {
          userId: response.userId,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        };
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('❌ Failed to store auth data:', error);
      }
    } else {
      console.warn('⚠️ No accessToken in response - might require 2FA');
    }
    
    return response;
  }

  /**
   * Verify OTP for login (when 2FA is enabled)
   */
  static async verifyLoginOtp(data: { email: string; otp: string }): Promise<AuthData> {
    const response = await ApiService.post<AuthData>('/auth/login/verify', data);
    
    console.log('🔐 Login verify response:', response);
    
    // Store tokens and user data
    if (response.accessToken) {
      try {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        console.log('✅ Token saved to localStorage:', response.accessToken.substring(0, 20) + '...');
        
        // Store user data
        const user: User = {
          userId: response.userId,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        };
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('❌ Failed to store auth data:', error);
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
          firstName: response.firstName,
          lastName: response.lastName,
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
   * Update user avatar only
   */
  static async updateAvatar(avatarUrl: string): Promise<User> {
    console.log('📡 updateAvatar: Fetching current user profile...');
    // Get current user to preserve other fields
    const currentUser = await this.fetchUserProfile();
    console.log('📋 Current user data:', currentUser);
    
    const updatePayload = {
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      dob: currentUser.dob || null,
      gender: currentUser.gender || null,
      address: currentUser.address || null,
      avatarUrl: avatarUrl,
    };
    
    console.log('📡 updateAvatar: Sending PUT request to /users/me with payload:', updatePayload);
    const response = await ApiService.put<any>('/users/me', updatePayload, true);
    console.log('📨 updateAvatar: Server response:', response);
    
    // Map backend response to User type
    const user: User = {
      userId: response.id || response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      userStatus: response.userStatus,
      is2FAEnabled: response.is2FAEnabled,
      roles: response.roleName ? [response.roleName] : undefined,
      postCount: response.postCount ?? response.totalPosts,
      totalPosts: response.totalPosts ?? response.postCount,
      dob: response.dob,
      gender: response.gender,
      address: response.address,
      avatarUrl: response.avatarUrl,
      roleId: response.roleId,
      roleName: response.roleName,
    };
    
    // Update stored user data
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
    
    return user;
  }

  /**
   * Update user profile info (without avatar)
   */
  static async updateProfileInfo(data: { firstName?: string; lastName?: string; dob?: string; gender?: string; address?: string }): Promise<User> {
    // Get current user to preserve avatar
    const currentUser = await this.fetchUserProfile();
    
    const updatePayload = {
      firstName: data.firstName ?? currentUser.firstName ?? '',
      lastName: data.lastName ?? currentUser.lastName ?? '',
      dob: data.dob ?? currentUser.dob ?? null,
      gender: data.gender ?? currentUser.gender ?? null,
      address: data.address ?? currentUser.address ?? null,
      avatarUrl: currentUser.avatarUrl || null,
    };
    
    const response = await ApiService.put<any>('/users/me', updatePayload, true);
    
    // Map backend response to User type
    const user: User = {
      userId: response.id || response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      userStatus: response.userStatus,
      is2FAEnabled: response.is2FAEnabled,
      roles: response.roleName ? [response.roleName] : undefined,
      postCount: response.postCount ?? response.totalPosts,
      totalPosts: response.totalPosts ?? response.postCount,
      dob: response.dob,
      gender: response.gender,
      address: response.address,
      avatarUrl: response.avatarUrl,
      roleId: response.roleId,
      roleName: response.roleName,
    };
    
    // Update stored user data
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
    
    return user;
  }

  /**
   * Update user profile (legacy - use updateAvatar or updateProfileInfo instead)
   */
  static async updateProfile(userId: string, data: UpdateProfileRequest): Promise<User> {
    // Only send fields that backend accepts in UserUpdateRequest
    const updatePayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      gender: data.gender,
      address: data.address,
      avatarUrl: data.avatarUrl,
    };
    
    const response = await ApiService.put<any>('/users/me', updatePayload, true);
    
    // Map backend response to User type
    const user: User = {
      userId: response.id || response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      userStatus: response.userStatus,
      is2FAEnabled: response.is2FAEnabled,
      roles: response.roleName ? [response.roleName] : undefined,
      postCount: response.postCount ?? response.totalPosts,
      totalPosts: response.totalPosts ?? response.postCount,
      dob: response.dob,
      gender: response.gender,
      address: response.address,
      avatarUrl: response.avatarUrl,
      roleId: response.roleId,
      roleName: response.roleName,
    };
    
    // Update stored user data
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
    
    return user;
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
   * Fetch current user profile from API
   */
  static async fetchUserProfile(): Promise<User> {
    const response = await ApiService.get<any>('/users/me', true);
    
    // Map backend response (id) to frontend User type (userId)
    const user: User = {
      userId: response.id || response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      userStatus: response.userStatus,
      is2FAEnabled: response.is2FAEnabled,
      roles: response.roleName ? [response.roleName] : undefined,
      dob: response.dob,
      gender: response.gender,
      address: response.address,
      avatarUrl: response.avatarUrl,
      roleId: response.roleId,
      roleName: response.roleName,
    };
    
    // Update localStorage with mapped data
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to update user in localStorage:', error);
    }
    
    return user;
  }

  /**
   * Fetch a user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    const response = await ApiService.get<any>(`/users/${userId}`, true);

    const user: User = {
      userId: response.id || response.userId,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      userStatus: response.userStatus,
      is2FAEnabled: response.is2FAEnabled,
      roles: response.roleName ? [response.roleName] : undefined,
      dob: response.dob,
      gender: response.gender,
      address: response.address,
      avatarUrl: response.avatarUrl,
      roleId: response.roleId,
      roleName: response.roleName,
    };

    return user;
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
