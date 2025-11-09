// HTTP Client base para todas las llamadas API
// Centraliza configuración, headers, y manejo de errores

export interface ApiError {
  message: string;
  status: number;
  statusText: string;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  skipAuthRefresh?: boolean; // Para evitar loops infinitos en refresh
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(success: boolean) => void> = [];

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Añade un callback que será llamado cuando el refresh termine
   */
  private onRefreshed(success: boolean) {
    this.refreshSubscribers.forEach(callback => callback(success));
    this.refreshSubscribers = [];
  }

  /**
   * Añade una petición a la cola de espera durante el refresh
   */
  private addRefreshSubscriber(callback: (success: boolean) => void) {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Intenta refrescar el access token usando el refresh token
   */
  private async attemptRefreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // Si ya hay un refresh en progreso, esperar a que termine
      return new Promise((resolve) => {
        this.addRefreshSubscriber((success: boolean) => {
          resolve(success);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Importante: enviar cookies
      });

      if (response.ok) {
        this.isRefreshing = false;
        this.onRefreshed(true);
        return true;
      }

      this.isRefreshing = false;
      this.onRefreshed(false);
      return false;
    } catch (error) {
      this.isRefreshing = false;
      this.onRefreshed(false);
      return false;
    }
  }

  private async handleResponse<T>(response: Response, config?: RequestConfig): Promise<T> {
    // Si es 401 y no es una petición de refresh, intentar renovar token
    if (response.status === 401 && !config?.skipAuthRefresh) {
      const refreshSuccess = await this.attemptRefreshToken();

      if (refreshSuccess) {
        // Reintentar la petición original
        // Nota: La petición original debe ser reintentada por el caller
        const error: ApiError = {
          message: 'Token refreshed, retry request',
          status: 401,
          statusText: 'Unauthorized - Token Refreshed',
        };
        throw error;
      } else {
        // Si el refresh falló, el usuario debe hacer login de nuevo
        // Disparar evento para que AuthContext maneje el logout
        window.dispatchEvent(new CustomEvent('auth:session-expired'));

        const error: ApiError = {
          message: 'Session expired. Please login again.',
          status: 401,
          statusText: 'Unauthorized',
        };
        throw error;
      }
    }

    if (!response.ok) {
      let errorMessage = 'An unknown error occurred';

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        statusText: response.statusText,
      };

      throw error;
    }

    // Si la respuesta es 204 No Content, no hay JSON para parsear
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private mergeHeaders(customHeaders?: HeadersInit): HeadersInit {
    return {
      ...this.defaultHeaders,
      ...customHeaders,
    };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.mergeHeaders(config?.headers),
      credentials: 'include', // Enviar cookies automáticamente
      signal: config?.signal,
    });

    return this.handleResponse<T>(response, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.mergeHeaders(config?.headers),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Enviar cookies automáticamente
      signal: config?.signal,
    });

    return this.handleResponse<T>(response, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.mergeHeaders(config?.headers),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Enviar cookies automáticamente
      signal: config?.signal,
    });

    return this.handleResponse<T>(response, config);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.mergeHeaders(config?.headers),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Enviar cookies automáticamente
      signal: config?.signal,
    });

    return this.handleResponse<T>(response, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.mergeHeaders(config?.headers),
      credentials: 'include', // Enviar cookies automáticamente
      signal: config?.signal,
    });

    return this.handleResponse<T>(response, config);
  }

  // Método para añadir headers globales (útil para tokens de autenticación)
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      [key]: value,
    };
  }

  // Método para remover headers globales
  removeDefaultHeader(key: string): void {
    const headers = { ...this.defaultHeaders };
    delete (headers as Record<string, string>)[key];
    this.defaultHeaders = headers;
  }
}

// Exportar instancia única (singleton)
export const apiClient = new ApiClient();
