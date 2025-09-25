// Google OAuth and authentication configuration
import { User } from '@/types/app';

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || '',
  scopes: [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.rosters',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'https://www.googleapis.com/auth/classroom.profile.photos',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export class AuthManager {
  private static instance: AuthManager;
  private tokens: AuthTokens | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Google OAuth URL generation
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
      scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<AuthTokens> {
    const response = await fetch('/api/auth/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
    return tokens;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.tokens.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
    return tokens;
  }

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const accessToken = await this.getValidAccessToken();
    
    const response = await fetch('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  // Token management
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    }
  }

  getTokens(): AuthTokens | null {
    if (this.tokens) return this.tokens;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth_tokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
        return this.tokens;
      }
    }
    
    return null;
  }

  async getValidAccessToken(): Promise<string> {
    const tokens = this.getTokens();
    if (!tokens) {
      throw new Error('No tokens available');
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    const expiresAt = tokens.expiresAt - 5 * 60 * 1000; // 5 minutes buffer

    if (now >= expiresAt) {
      const refreshedTokens = await this.refreshAccessToken();
      return refreshedTokens.accessToken;
    }

    return tokens.accessToken;
  }

  // Logout
  logout(): void {
    this.tokens = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('user_profile');
    }
  }

  // Check authentication status
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return tokens !== null && tokens.accessToken !== '';
  }

  // Token validation
  isTokenExpired(token: AuthTokens): boolean {
    return Date.now() >= token.expiresAt;
  }
}

// Utility functions
export function getAuthManager(): AuthManager {
  return AuthManager.getInstance();
}

export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    const authUrl = getAuthManager().getAuthUrl();
    window.location.href = authUrl;
  }
}

export function handleAuthError(error: unknown): void {
  console.error('Authentication error:', error);
  
  // If it's a token-related error, redirect to login
  if (error instanceof Error && error.message.includes('token')) {
    getAuthManager().logout();
    redirectToLogin();
  }
}

// React hook for authentication (to be used in components)
export function useAuth() {
  // This would typically be implemented with React Context
  // For now, it's a placeholder for the hook structure
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: redirectToLogin,
    logout: () => getAuthManager().logout(),
  };
}
