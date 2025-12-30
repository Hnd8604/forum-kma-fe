const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://72.60.198.235:8080/api/v1';

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export class ApiService {
  private static getAuthToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  private static getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch {
      return null;
    }
  }

  private static setAuthToken(token: string): void {
    try {
      localStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Failed to save access token:', error);
    }
  }

  private static clearAuth(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  }

  private static getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const data = await response.json();
      const newAccessToken = data.result?.accessToken || data.accessToken;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      this.setAuthToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      this.clearAuth();
      window.location.href = '/';
      throw error;
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false,
    _isRetry: boolean = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(requiresAuth);

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && requiresAuth && !_isRetry) {
        if (isRefreshing) {
          // Wait for the refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry with new token
            return this.request<T>(endpoint, options, requiresAuth, true);
          });
        }

        isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request with new token
          return this.request<T>(endpoint, options, requiresAuth, true);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          throw refreshError;
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText || 'An error occurred',
        }));

        throw {
          message: errorData.message || 'Request failed',
          statusCode: response.status,
          errors: errorData.errors,
        };
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();

        // Check if backend returned an error in the response body (code !== "200")
        if (jsonData && typeof jsonData === 'object' && 'code' in jsonData) {
          // PS_015 is a special case: interaction removed (toggle) - not an error
          const isInteractionRemoved = jsonData.code === 'PS_015';

          if (jsonData.code !== '200' && jsonData.code !== 200 && !isInteractionRemoved) {
            throw {
              message: jsonData.message || 'Request failed',
              statusCode: response.status,
              code: jsonData.code,
            };
          }
        }

        // If response has the API structure {code, message, data/result}, return data/result
        if (jsonData && typeof jsonData === 'object') {
          // Check for 'result' field (backend uses 'result' not 'data')
          if ('result' in jsonData) {
            return jsonData.result as T;
          }
          // Fallback to 'data' field
          if ('data' in jsonData) {
            return jsonData.data as T;
          }
        }

        return jsonData as T;
      }

      return {} as T;
    } catch (error: any) {
      // Re-throw API errors
      if (error.statusCode) {
        throw error;
      }

      // Handle network errors
      throw {
        message: error.message || 'Network error occurred',
        statusCode: 0,
      };
    }
  }

  static async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requiresAuth);
  }

  static async post<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = false
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  static async put<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = false
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  static async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth);
  }

  static async patch<T>(
    endpoint: string,
    data: any,
    requiresAuth: boolean = false
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  /**
   * Upload file using multipart/form-data
   */
  static async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    requiresAuth: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);

    // Add any additional data fields
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    // Headers for file upload (no Content-Type, browser will set it with boundary)
    const headers: HeadersInit = {};
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText || 'Upload failed',
        }));

        throw {
          message: errorData.message || 'Upload failed',
          statusCode: response.status,
          errors: errorData.errors,
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();

        // Check for error codes (code is string "200" not number)
        if (jsonData && typeof jsonData === 'object' && 'code' in jsonData) {
          const code = String(jsonData.code);
          if (code !== '200') {
            throw {
              message: jsonData.message || 'Upload failed',
              statusCode: response.status,
              code: jsonData.code,
            };
          }
        }

        // Extract result/data from response
        if ('result' in jsonData) {
          return jsonData.result as T;
        }
        if ('data' in jsonData) {
          return jsonData.data as T;
        }

        return jsonData as T;
      }

      return {} as T;
    } catch (error: any) {
      if (error.statusCode) {
        throw error;
      }
      throw {
        message: error.message || 'Upload error occurred',
        statusCode: 0,
      };
    }
  }
}
