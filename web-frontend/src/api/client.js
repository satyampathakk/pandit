import { API_BASE_URL } from './config.js';

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function getUserType() {
  return localStorage.getItem('user_type');
}

export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(endpoint, useAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(useAuth ? getAuthHeaders() : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`API GET failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiPost(endpoint, data, useAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(useAuth ? getAuthHeaders() : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'API request failed';
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(message);
  }

  return response.json();
}
