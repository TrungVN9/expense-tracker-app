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

export interface TransactionPayload {
  amount: number;
  category: string;
  date: string; // ISO date string (YYYY-MM-DD)
  description?: string;
  type: 'expense' | 'income' | string;
}

export interface TransactionResponse {
  id?: number;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: string;
  createdAt?: string;
}

/** Bills and Budgets: payload/response types and endpoints */
export interface BillPayload {
  amount: number;
  dueDate: string; // ISO date
  description?: string;
  category?: string;
  recurring?: boolean;
  paid?: boolean;
}

export interface BillResponse {
  id?: number;
  amount: number;
  dueDate: string;
  description?: string;
  category?: string;
  recurring?: boolean;
  paid?: boolean;
  createdAt?: string;
}

export interface BudgetPayload {
  name: string;
  limit: number;
  period?: 'monthly' | 'weekly' | 'yearly' | string;
  categories?: string[];
}

export interface BudgetResponse {
  id?: number;
  name: string;
  limit: number;
  period: string;
  categories?: string[];
  spent?: number;
  createdAt?: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Array<{ category: string; amount: number }>;
  recentTransactions: TransactionResponse[];
  upcomingBills?: BillResponse[];
  budgets?: BudgetResponse[];
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
        // Try parse error body if present, otherwise throw generic
        const text = await response.text().catch(() => '');
        let errorMsg = `HTTP Error: ${response.status}`;
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
          } catch (e) {
            errorMsg = text;
          }
        }
        throw new Error(errorMsg);
      }

      // Some successful responses (e.g. 204 No Content) have empty bodies.
      // Safely handle empty response bodies to avoid `Unexpected end of JSON input`.
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 204) {
        // No content
        return null as unknown as T;
      }

      const text = await response.text();
      if (!text) {
        return null as unknown as T;
      }

      if (contentType.includes('application/json')) {
        return JSON.parse(text) as T;
      }

      // If not JSON, return text as unknown (caller should handle it)
      return text as unknown as T;
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
   * Transaction Endpoints
   */

  /**
   * Create a transaction (expense or income)
   */
  async createTransaction(data: TransactionPayload): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get transactions for the authenticated user
   */
  async getTransactions(): Promise<TransactionResponse[]> {
    return this.request<TransactionResponse[]>('/api/transactions', {
      method: 'GET',
    });
  }

  /** Bills endpoints */
  async createBill(data: BillPayload): Promise<BillResponse> {
    return this.request<BillResponse>('/api/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBills(): Promise<BillResponse[]> {
    return this.request<BillResponse[]>('/api/bills', {
      method: 'GET',
    });
  }

  /** Get upcoming bills (used on dashboard) */
  async getUpcomingBills(): Promise<BillResponse[]> {
    // try a dedicated upcoming endpoint; backend may also support query param fallback
    try {
      return await this.request<BillResponse[]>('/api/bills/upcoming', { method: 'GET' });
    } catch (e) {
      return this.request<BillResponse[]>('/api/bills?upcoming=true', { method: 'GET' });
    }
  }

  async updateBill(id: number | string, data: Partial<BillPayload>): Promise<BillResponse> {
    return this.request<BillResponse>(`/api/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBill(id: number | string): Promise<void> {
    return this.request<void>(`/api/bills/${id}`, {
      method: 'DELETE',
    });
  }

  /** Budgets endpoints */
  async createBudget(data: BudgetPayload): Promise<BudgetResponse> {
    return this.request<BudgetResponse>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBudgets(): Promise<BudgetResponse[]> {
    return this.request<BudgetResponse[]>('/api/budgets', {
      method: 'GET',
    });
  }

  /** Get a summarized budget status used on dashboard */
  async getBudgetStatus(): Promise<any> {
    // expected to return { overallPercentage: number, details?: ... }
    try {
      return await this.request<any>('/api/budgets/status', { method: 'GET' });
    } catch (e) {
      // fallback to dashboard summary if budgets/status isn't implemented
      try {
        const summary = await this.getDashboardSummary();
        return { overallPercentage: summary && summary.totalExpenses && summary.totalIncome ? Math.round((summary.totalExpenses / (summary.totalIncome || 1)) * 100) : 0 };
      } catch (err) {
        return null;
      }
    }
  }

  async updateBudget(id: number | string, data: Partial<BudgetPayload>): Promise<BudgetResponse> {
    return this.request<BudgetResponse>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBudget(id: number | string): Promise<void> {
    return this.request<void>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  /** Dashboard summary */
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/api/dashboard/summary', {
      method: 'GET',
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
