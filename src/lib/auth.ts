export type StoredUser = {
  name?: string;
  email?: string;
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  const rawUser = window.localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem('token') && getStoredUser());
};
