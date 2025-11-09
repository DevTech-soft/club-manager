// Auth API endpoints
import { apiClient } from '../apiClient';
import { LoginRequest, LoginResponse } from '../api.types';

export const authApi = {
  /**
   * Login user
   * @param user - Username
   * @param pass - Password
   * @returns Login response with user info (tokens in httpOnly cookies)
   */
  login: (user: string, pass: string): Promise<LoginResponse> => {
    const request: LoginRequest = { user, pass };
    return apiClient.post<LoginResponse>('/auth/login', request, {
      skipAuthRefresh: true, // No intentar refresh en login
    });
  },

  /**
   * Logout user - clears httpOnly cookies on server
   * @returns Success response
   */
  logout: (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/logout', undefined, {
      skipAuthRefresh: true, // No intentar refresh en logout
    });
  },

  /**
   * Refresh access token using refresh token cookie
   * @returns Success response
   */
  refresh: (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>('/auth/refresh', undefined, {
      skipAuthRefresh: true, // No intentar refresh en la petición de refresh (evitar loop)
    });
  },

  /**
   * Get current authenticated user info
   * @returns User info
   */
  me: (): Promise<{ id: string; role: string }> => {
    return apiClient.get<{ id: string; role: string }>('/auth/me');
  },
};
