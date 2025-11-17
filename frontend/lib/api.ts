/**
 * API Service Layer
 * Centralized API calls with automatic token management and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  createdAt?: string;
  username?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  occupation?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the JWT token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Set the JWT token in localStorage
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  /**
   * Remove the JWT token from localStorage
   */
  public removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  /**
   * Build headers with authorization token
   */
  private getHeaders(withAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (withAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Generic fetch method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    withAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(withAuth),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Re-throw the error to be handled by the calling function (e.g., in the UI component)
      throw error;
    }
  }

  /**
   * Auth Endpoints
   */

  async login(email: string, password: string): Promise<{ token: string }> {
    const response = await this.request<{ token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async signup(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ token: string }> {
    const response = await this.request<{ token: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      },
      false
    );

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * User Endpoints
   */

  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/users/me', {
      method: 'GET',
    });
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Logout
   */
  logout(): void {
    this.removeToken();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;
