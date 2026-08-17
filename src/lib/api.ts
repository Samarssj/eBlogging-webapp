const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ApiPost {
  id: string;
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorName: string;
  category: string;
  readTime: string;
  image?: string;
  likes: number;
  comments: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  async get<T = any>(endpoint: string, authenticated = false): Promise<T> {
    const headers: HeadersInit = {};
    if (authenticated) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Something went wrong');
    return result;
  },

  async post<T = any>(endpoint: string, data: any, authenticated = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authenticated) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Something went wrong');
    return result;
  },

  async put<T = any>(endpoint: string, data: any, authenticated = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authenticated) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Something went wrong');
    return result;
  },

  async delete<T = any>(endpoint: string, authenticated = true): Promise<T> {
    const headers: HeadersInit = {};
    if (authenticated) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Something went wrong');
    return result;
  },
};
