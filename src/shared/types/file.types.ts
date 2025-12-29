export interface UploadResponse {
  resourceUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type FileUploadType = 'avatar' | 'image' | 'document';

export interface FileUploadOptions {
  type: FileUploadType;
  file: File;
  onProgress?: (progress: number) => void;
}
