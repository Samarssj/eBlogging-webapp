const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ApiPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  author: string;
  authorName: string;
  category: string;
  readTime: string;
  likes: number;
  comments: number;
  status: 'draft' | 'published';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export interface ApiComment {
  id: string;
  author: { id: string; name: string };
  content: string;
  parentComment?: string | null;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
}

const makeHeaders = (authenticated: boolean, json = false): HeadersInit => {
  const headers: HeadersInit = json ? { 'Content-Type': 'application/json' } : {};
  if (authenticated) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Something went wrong');
  return result as T;
};

export const api = {
  async get<T = unknown>(endpoint: string, authenticated = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', headers: makeHeaders(authenticated) });
    return parseResponse<T>(response);
  },

  async post<T = unknown>(endpoint: string, data: unknown, authenticated = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: makeHeaders(authenticated, true),
      body: JSON.stringify(data),
    });
    return parseResponse<T>(response);
  },

  async put<T = unknown>(endpoint: string, data: unknown, authenticated = false): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: makeHeaders(authenticated, true),
      body: JSON.stringify(data),
    });
    return parseResponse<T>(response);
  },

  async delete<T = unknown>(endpoint: string, authenticated = true): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers: makeHeaders(authenticated) });
    return parseResponse<T>(response);
  },
};
