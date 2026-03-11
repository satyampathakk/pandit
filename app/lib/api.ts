import { API_BASE_URL } from '@/lib/config';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body, headers: customHeaders } = options;
  const headers: Record<string, string> = {
    ...customHeaders,
  };

  // Only add Content-Type for JSON requests
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined :
      body instanceof FormData ? body :
        JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
}

export const apiGet = <T>(endpoint: string, token?: string | null) =>
  request<T>(endpoint, { method: 'GET', token });

export const apiPost = <T>(endpoint: string, body: unknown, token?: string | null, headers?: Record<string, string>) =>
  request<T>(endpoint, { method: 'POST', body, token, headers });

export const apiPut = <T>(endpoint: string, body: unknown | undefined, token?: string | null, headers?: Record<string, string>) =>
  request<T>(endpoint, { method: 'PUT', body, token, headers });

export const apiDelete = <T>(endpoint: string, token?: string | null) =>
  request<T>(endpoint, { method: 'DELETE', token });
