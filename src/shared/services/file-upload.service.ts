import { ApiResponse, FileUploadType, UploadResponse } from '../types/file.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://72.60.198.235:8080/api/v1';

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
   * @param file - File to upload
   * @param type - Type of upload (avatar, image, document)
   * @param onProgress - Optional progress callback
   * @returns Promise with the uploaded file URL
   */
  static async uploadFile(
    file: File,
    type: FileUploadType = 'image',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `/files/upload/${type}`;
    const url = `${API_BASE_URL}${endpoint}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: ApiResponse<UploadResponse> = JSON.parse(xhr.responseText);
            if (response.success && response.data) {
              resolve(response.data.resourceUrl);
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', url);

      // Add auth token if available
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
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
   * Upload a document (PDF, DOCX, ZIP, RAR, etc.)
   */
  static async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return this.uploadFile(file, 'document', onProgress);
  }

  /**
   * Delete a file using its public URL
   */
  static async deleteFile(publicUrl: string): Promise<void> {
    const url = `${API_BASE_URL}/files/delete?url=${encodeURIComponent(publicUrl)}`;
    const token = this.getAuthToken();

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(
    file: File,
    type: FileUploadType,
    maxSizeMB: number = 10
  ): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    // Check file type based on upload type
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
      return {
        valid: false,
        error: `Invalid file type for ${type} upload`,
      };
    }

    return { valid: true };
  }
}
