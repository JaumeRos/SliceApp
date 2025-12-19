import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { googleSignInService } from '../services/googleSignInService';
import config from '../config/index';

interface User {
  id: number;
  email: string;
  onboarding_completed?: boolean;
  tennis_level?: string;
  sport?: string;
  court_preference?: string;
  playing_frequency?: string;
  preferred_times?: string[];
  full_name?: string;
  profile_image_url?: string;
  bio?: string;
  link?: string;
  sex?: string;
  birthday?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  hasUser: boolean;
  hasToken: boolean;
  userId?: number;
  handlingLoginError: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithApple: () => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  handlingLoginError: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appLoading, setAppLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    hasUser: false,
    hasToken: false,
    userId: undefined,
    handlingLoginError: false,
    user: null,
    accessToken: null,
    refreshToken: null,
  });

  const internalRefreshAccessToken = useCallback(async (currentRefreshToken?: string | null) => {
    try {
      console.log('[AUTH CONTEXT] Attempting token refresh');
      const tokenToUse = currentRefreshToken || await AsyncStorage.getItem('@auth_refresh_token');

      if (!tokenToUse) {
        await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
        setAuthState({
          isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
          handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
        });
        return null;
      }

      const response = await fetch(`${config.apiUrl}/tennis/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenToUse }),
      });

      if (!response.ok) {
        await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
        setAuthState({
          isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
          handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
        });
        return null;
      }

      const data = await response.json();
      if (!data.accessToken) {
        await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
        setAuthState({
          isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
          handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
        });
        return null;
      }

      await AsyncStorage.setItem('@auth_access_token', data.accessToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem('@auth_refresh_token', data.refreshToken);
        return { accessToken: data.accessToken, refreshToken: data.refreshToken };
      }
      return { accessToken: data.accessToken, refreshToken: tokenToUse };
    } catch (error) {
      console.error('[AUTH CONTEXT] Token refresh error:', error);
      await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
      setAuthState({
        isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
        handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
      });
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log('[AUTH CONTEXT] Logging out');
      setLoading(true);

      await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);

      if (authState.refreshToken) {
        try {
          await fetch(`${config.apiUrl}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: authState.refreshToken }),
          });
        } catch (error) {
          console.error('[AUTH CONTEXT] Error during backend logout:', error);
        }
      }

      setAuthState({
        isAuthenticated: false,
        hasUser: false,
        hasToken: false,
        userId: undefined,
        handlingLoginError: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    } catch (error) {
      console.error('[AUTH CONTEXT] Error during sign out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [authState.refreshToken]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[AUTH CONTEXT] signIn called');
    setAuthState(prev => ({ ...prev, handlingLoginError: true }));

    try {
      const response = await api.auth.login(email, password);

      if (!response.success) {
        throw new Error('Authentication failed');
      }

      await Promise.all([
        AsyncStorage.setItem('@auth_access_token', response.accessToken),
        AsyncStorage.setItem('@auth_refresh_token', response.refreshToken),
      ]);

      // Set loading to true while we refresh user data
      setLoading(true);

      // Refresh user data FIRST to get complete profile including onboarding_completed
      try {
        const userResponse = await api.auth.me();
        if (userResponse.success && userResponse.user) {
          await AsyncStorage.setItem('@user', JSON.stringify(userResponse.user));
          // Set state with complete user data
          setAuthState({
            isAuthenticated: true,
            hasUser: true,
            hasToken: true,
            userId: userResponse.user.id,
            handlingLoginError: false,
            user: userResponse.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
          console.log('[AUTH CONTEXT] User data refreshed after sign-in, onboarding_completed:', userResponse.user.onboarding_completed);
        } else {
          // Fallback to login response if refresh fails
          setAuthState({
            isAuthenticated: true,
            hasUser: true,
            hasToken: true,
            userId: response.user.id,
            handlingLoginError: false,
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        }
      } catch (refreshError) {
        console.error('[AUTH CONTEXT] Error refreshing user after sign-in:', refreshError);
        // Fallback to login response if refresh fails
        setAuthState({
          isAuthenticated: true,
          hasUser: true,
          hasToken: true,
          userId: response.user.id,
          handlingLoginError: false,
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('[AUTH CONTEXT] Login error:', error);
      setAuthState(prev => ({ ...prev, handlingLoginError: false }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      console.log('[AUTH CONTEXT] ===== STARTING SIGN UP =====');
      console.log('[AUTH CONTEXT] Email:', email);
      setLoading(true);
      const response = await api.auth.register(email, password);

      console.log('[AUTH CONTEXT] ===== SIGN UP RESPONSE =====');
      console.log('[AUTH CONTEXT] User from registration:', JSON.stringify(response.user, null, 2));

      await AsyncStorage.setItem('@auth_access_token', response.accessToken);
      await AsyncStorage.setItem('@auth_refresh_token', response.refreshToken);
      await AsyncStorage.setItem('@user', JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        hasUser: true,
        hasToken: true,
        userId: response.user.id,
        handlingLoginError: false,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      console.log('[AUTH CONTEXT] ✅ Sign up complete, user state set');
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      console.log('[AUTH CONTEXT] 🍎 Starting Apple Sign-In');

      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token');
      }

      const userObj = appleAuthResponse.user && typeof appleAuthResponse.user === 'object' ? {
        name: (appleAuthResponse.user as any).name ? {
          firstName: (appleAuthResponse.user as any).name.firstName || undefined,
          lastName: (appleAuthResponse.user as any).name.lastName || undefined,
        } : undefined,
        email: (appleAuthResponse.user as any).email || undefined,
      } : undefined;

      const response = await fetch(`${config.apiUrl}/tennis/auth/apple-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: appleAuthResponse.identityToken,
          authorizationCode: appleAuthResponse.authorizationCode || '',
          user: userObj,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to authenticate with Apple: ${errorText}`);
      }

      const data = await response.json();

      await AsyncStorage.setItem('@auth_access_token', data.accessToken);
      await AsyncStorage.setItem('@auth_refresh_token', data.refreshToken);

      // Set loading to true while we refresh user data
      setLoading(true);

      // Refresh user data FIRST to get complete profile including onboarding_completed
      try {
        const userResponse = await api.auth.me();
        if (userResponse.success && userResponse.user) {
          await AsyncStorage.setItem('@user', JSON.stringify(userResponse.user));
          // Set state with complete user data
          setAuthState({
            isAuthenticated: true,
            hasUser: true,
            hasToken: true,
            userId: userResponse.user.id,
            handlingLoginError: false,
            user: userResponse.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          console.log('[AUTH CONTEXT] User data refreshed after Apple sign-in, onboarding_completed:', userResponse.user.onboarding_completed);
        } else {
          // Fallback to Apple sign-in response if refresh fails
          await AsyncStorage.setItem('@user', JSON.stringify(data.user));
          setAuthState({
            isAuthenticated: true,
            hasUser: true,
            hasToken: true,
            userId: data.user.id,
            handlingLoginError: false,
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        }
      } catch (refreshError) {
        console.error('[AUTH CONTEXT] Error refreshing user after Apple sign-in:', refreshError);
        // Fallback to Apple sign-in response if refresh fails
        await AsyncStorage.setItem('@user', JSON.stringify(data.user));
        setAuthState({
          isAuthenticated: true,
          hasUser: true,
          hasToken: true,
          userId: data.user.id,
          handlingLoginError: false,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } finally {
        setLoading(false);
      }

      return data;
    } catch (error: any) {
      console.error('[AUTH CONTEXT] 🍎 Apple Sign-In error:', error);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      console.log('[AUTH CONTEXT] Starting Google Sign-In');

      await googleSignInService.configure();
      const googleUser = await googleSignInService.signIn();

      const response = await api.auth.googleSignIn(googleUser.idToken);

      if (!response.success) {
        throw new Error(response.error || 'Google authentication failed');
      }

      await Promise.all([
        AsyncStorage.setItem('@auth_access_token', response.accessToken),
        AsyncStorage.setItem('@auth_refresh_token', response.refreshToken),
      ]);

      // Set loading to true while we refresh user data
      setLoading(true);

      // Refresh user data FIRST to get complete profile including onboarding_completed
      try {
        const userResponse = await api.auth.me();
        if (userResponse.success && userResponse.user) {
          await AsyncStorage.setItem('@user', JSON.stringify(userResponse.user));
          // Set state with complete user data
          setAuthState({
            isAuthenticated: true,
            hasUser: true,
            hasToken: true,
            userId: userResponse.user.id,
            handlingLoginError: false,
            user: userResponse.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
          console.log('[AUTH CONTEXT] User data refreshed after Google sign-in, onboarding_completed:', userResponse.user.onboarding_completed);
        } else {
          // Fallback to Google sign-in response if refresh fails
          await AsyncStorage.setItem('@user', JSON.stringify(response.user));
          setAuthState({
            isAuthenticated: true,
            hasUser: true,
            hasToken: true,
            userId: response.user.id,
            handlingLoginError: false,
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        }
      } catch (refreshError) {
        console.error('[AUTH CONTEXT] Error refreshing user after Google sign-in:', refreshError);
        // Fallback to Google sign-in response if refresh fails
        await AsyncStorage.setItem('@user', JSON.stringify(response.user));
        setAuthState({
          isAuthenticated: true,
          hasUser: true,
          hasToken: true,
          userId: response.user.id,
          handlingLoginError: false,
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      } finally {
        setLoading(false);
      }

      return response;
    } catch (error: any) {
      console.error('[AUTH CONTEXT] Google Sign-In error:', error);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      console.log('[AUTH CONTEXT] Refreshing user data');
      const response = await api.auth.me();

      if (response.success && response.user) {
        console.log('[AUTH CONTEXT] User data received:', JSON.stringify(response.user, null, 2));
        await AsyncStorage.setItem('@user', JSON.stringify(response.user));
        setAuthState(prev => ({
          ...prev,
          user: response.user,
        }));
        console.log('[AUTH CONTEXT] User data refreshed successfully');
        console.log('[AUTH CONTEXT] onboarding_completed status:', response.user.onboarding_completed);
      } else {
        // User not found or invalid response - clear tokens
        console.log('[AUTH CONTEXT] User not found or invalid response, clearing tokens');
        await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
        setAuthState({
          isAuthenticated: false,
          hasUser: false,
          hasToken: false,
          userId: undefined,
          handlingLoginError: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      }
    } catch (error: any) {
      console.error('[AUTH CONTEXT] Error refreshing user:', error);
      // If user not found, clear tokens and sign out
      if (error?.message?.includes('not found') || error?.message?.includes('User not found')) {
        console.log('[AUTH CONTEXT] User not found in tennis_users, clearing tokens');
        await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
        setAuthState({
          isAuthenticated: false,
          hasUser: false,
          hasToken: false,
          userId: undefined,
          handlingLoginError: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      }
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setAppLoading(true);
      try {
        console.log('[AUTH CONTEXT] Initializing auth state');

        let loadedRefreshToken = await AsyncStorage.getItem('@auth_refresh_token');
        const userStr = await AsyncStorage.getItem('@user');
        let user = null;

        if (userStr) {
          user = JSON.parse(userStr);
        }

        if (loadedRefreshToken && user) {
          const refreshedTokens = await internalRefreshAccessToken(loadedRefreshToken);
          if (refreshedTokens && refreshedTokens.accessToken) {
            setAuthState({
              isAuthenticated: true, hasUser: true, hasToken: true, userId: user.id,
              handlingLoginError: false, user,
              accessToken: refreshedTokens.accessToken,
              refreshToken: refreshedTokens.refreshToken,
            });
          } else {
            await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
            setAuthState({
              isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
              handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
            });
          }
        } else {
          await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
          setAuthState({
            isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
            handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
          });
        }
      } catch (error) {
        console.error('[AUTH CONTEXT] Error initializing auth:', error);
        await AsyncStorage.multiRemove(['@auth_access_token', '@auth_refresh_token', '@user']);
        setAuthState({
          isAuthenticated: false, hasUser: false, hasToken: false, userId: undefined,
          handlingLoginError: false, user: null, accessToken: null, refreshToken: null,
        });
      } finally {
        setAppLoading(false);
      }
    };

    initializeAuth();
  }, [internalRefreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        signIn,
        signUp,
        signOut,
        signInWithApple,
        signInWithGoogle,
        refreshUser,
        loading: loading || appLoading,
        handlingLoginError: authState.handlingLoginError,
        isAuthenticated: authState.isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

