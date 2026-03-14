import { create } from 'zustand';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  public_key: string;
}


interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  register: (username: string, email: string, password: string, publicKey: string, country: string, language: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
  guestLogin?: () => void;
}


export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,

  register: async (username: string, email: string, password: string, publicKey: string, country: string, language: string) => {
    try {
      set({ isLoading: true });
      const response = await apiService.post('/auth/register', {
        username,
        email,
        password,
        public_key: publicKey,
        country,
        language,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('privateKey', localStorage.getItem('privateKey') || '');

      set({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      set({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('privateKey');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    set({
      accessToken: access,
      refreshToken: refresh,
    });
  },
}));
