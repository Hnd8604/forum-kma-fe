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
        
        // If response has the API structure {code, message, data}, return data
        if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
          return jsonData.data as T;
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
}
