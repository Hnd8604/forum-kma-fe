import { ApiService } from '../../../shared/services/api.service';

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface VerifyChangePasswordRequest {
  otp: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const passwordService = {
  // Bước 1: Yêu cầu đổi mật khẩu (sẽ gửi OTP)
  async requestChangePassword(
    data: ChangePasswordRequest,
    accessToken: string
  ): Promise<ApiResponse<string>> {
    return ApiService.post<ApiResponse<string>>('/auth/change-password', data, true);
  },

  // Bước 2: Xác nhận đổi mật khẩu với OTP
  async verifyChangePassword(
    data: VerifyChangePasswordRequest,
    accessToken: string
  ): Promise<ApiResponse<string>> {
    return ApiService.post<ApiResponse<string>>('/auth/change-password/verify', data, true);
  },

  // Quên mật khẩu - Bước 1: Gửi OTP
  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    return ApiService.post<ApiResponse<string>>('/auth/forgot-password', { email });
  },

  // Quên mật khẩu - Bước 2: Xác thực OTP
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<string>> {
    return ApiService.post<ApiResponse<string>>('/auth/verify-otp', { email, otp });
  },

  // Quên mật khẩu - Bước 3: Reset mật khẩu
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ApiResponse<string>> {
    return ApiService.post<ApiResponse<string>>('/auth/reset-password', { 
      email, 
      otp, 
      newPassword 
    });
  },
};
