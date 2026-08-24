const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type RequestOptions = {
  method?: 'GET' | 'POST';
  data?: unknown;
  authenticated?: boolean;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.authenticated && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.data === undefined ? undefined : JSON.stringify(options.data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(result.message || 'Something went wrong');
  }
  return result as T;
}

export const api = {
  get: <T>(endpoint: string, authenticated = false) => request<T>(endpoint, { authenticated }),
  post: <T>(endpoint: string, data?: unknown, authenticated = false) =>
    request<T>(endpoint, { method: 'POST', data, authenticated }),
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  skills?: string[];
};

export type ApiPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
  savedByMe: boolean;
};

export type ApiComment = {
  id: string;
  author: { id: string; name: string };
  content: string;
  parentId: string | null;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
};
