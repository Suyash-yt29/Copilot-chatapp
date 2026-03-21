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
      console.log('[ AuthStore] 📝 Register API call to /auth/register', { email, username });
      set({ isLoading: true });
      const response = await apiService.post('/auth/register', {
        username,
        email,
        password,
        public_key: publicKey,
        country,
        language,
      });

      console.log('[AuthStore] ✅ Register success, storing tokens');
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
      console.error('[AuthStore] ❌ Register error:', error.message);
      console.error('[AuthStore] Error response:', error.response?.data);
      console.error('[AuthStore] Error status:', error.response?.status);
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      console.log('[AuthStore] 🔐 Login API call to /auth/login', { email });
      set({ isLoading: true });
      const response = await apiService.post('/auth/login', {
        email,
        password,
      });
      console.log('[AuthStore] ✅ Login success, storing tokens');
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      set({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('[AuthStore] ❌ Login error:', error.message);
      console.error('[AuthStore] Error response:', error.response?.data);
      console.error('[AuthStore] Error status:', error.response?.status);
      console.error('[AuthStore] Full error object:', error);
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
