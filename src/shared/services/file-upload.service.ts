import axios from 'axios';
import { FileUploadType, UploadResponse } from '../types/file.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://72.60.198.235:8080/api/v1';

// Create a separate axios instance for file uploads without default Content-Type
const uploadAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for uploads
});

// Response type from backend
interface ApiUploadResponse {
  code: string;
  message: string;
  result?: UploadResponse;
  data?: UploadResponse;
  success?: boolean;
}

export class FileUploadService {
  private static getAuthToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  /**
   * Upload a file to the server
   */
  static async uploadFile(
    file: File,
    type: FileUploadType = 'image',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getAuthToken();

    try {
      const response = await uploadAxios.post<ApiUploadResponse>(
        `/files/upload/${type}`,
        formData,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
          onUploadProgress: onProgress ? (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          } : undefined,
        }
      );

      const responseData = response.data;
      const data = responseData.result || responseData.data;
      const isSuccess = responseData.code === '200' || responseData.success === true;

      if (isSuccess && data && data.resourceUrl) {
        return data.resourceUrl;
      }

      throw new Error(responseData.message || 'Upload failed');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || `Upload failed: ${error.response.status}`);
      }
      throw error;
    }
  }

  /**
   * Upload an avatar image
   */
  static async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'avatar', onProgress);
  }

  /**
   * Upload a general image
   */
  static async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'image', onProgress);
  }

  /**
   * Upload a document
   */
  static async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'document', onProgress);
  }

  /**
   * Delete a file using its public URL
   */
  static async deleteFile(publicUrl: string): Promise<void> {
    const token = this.getAuthToken();

    await uploadAxios.delete('/files/delete', {
      params: { url: publicUrl },
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    });
  }

  /**
   * Validate file before upload
   */
  static validateFile(
    file: File,
    type: FileUploadType,
    maxSizeMB: number = 10
  ): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    const allowedTypes: Record<FileUploadType, string[]> = {
      avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-zip-compressed',
      ],
    };

    if (!allowedTypes[type].includes(file.type)) {
      return { valid: false, error: `Invalid file type for ${type} upload` };
    }

    return { valid: true };
  }
}
