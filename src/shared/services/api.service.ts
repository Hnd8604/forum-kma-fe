const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://72.60.198.235:8080/api/v1';

export class ApiService {
  private static getAuthToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
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

  static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(requiresAuth);

    // Debug: Log token and headers
    if (requiresAuth) {
      const token = this.getAuthToken();
      console.log('🔐 API Request - RequiresAuth:', requiresAuth);
      console.log('🎫 Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NULL');
      console.log('📋 Headers:', headers);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

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
        
        console.log('📦 Raw API Response:', jsonData);
        
        // Check if backend returned an error in the response body (code !== "200")
        if (jsonData && typeof jsonData === 'object' && 'code' in jsonData) {
          if (jsonData.code !== '200' && jsonData.code !== 200) {
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
            console.log('✅ Returning jsonData.result');
            return jsonData.result as T;
          }
          // Fallback to 'data' field
          if ('data' in jsonData) {
            console.log('✅ Returning jsonData.data');
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
        
        console.log('📦 Upload Response:', jsonData);

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
