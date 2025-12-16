import config from '../config/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('[API Service] Using API URL:', config.apiUrl);

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@auth_access_token');
  }

  private async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@auth_refresh_token');
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      console.log('[API Service] No refresh token available');
      return null;
    }

    try {
      console.log('[API Service] Attempting to refresh access token');
      const response = await fetch(`${config.apiUrl}/tennis/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.log('[API Service] Token refresh failed:', response.status);
        await AsyncStorage.removeItem('@auth_access_token');
        await AsyncStorage.removeItem('@auth_refresh_token');
        return null;
      }

      const data = await response.json();
      if (!data.accessToken) {
        console.log('[API Service] No access token in refresh response');
        return null;
      }

      await AsyncStorage.setItem('@auth_access_token', data.accessToken);
      console.log('[API Service] Access token refreshed successfully');
      return data.accessToken;
    } catch (error) {
      console.error('[API Service] Error refreshing token:', error);
      await AsyncStorage.removeItem('@auth_access_token');
      await AsyncStorage.removeItem('@auth_refresh_token');
      return null;
    }
  }

  public async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    providedToken?: string
  ): Promise<ApiResponse<T>> {
    try {
      let accessToken = providedToken || await this.getAccessToken();
      let refreshAttempted = false;

      if (!accessToken) {
        accessToken = await this.refreshAccessToken();
        refreshAttempted = true;
        if (!accessToken) {
          throw new Error('No valid access token available');
        }
      }

      const requestHeaders = new Headers(options.headers || {});
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);

      if (options.body instanceof FormData) {
        requestHeaders.delete('Content-Type');
      } else {
        if (!requestHeaders.has('Content-Type')) {
          requestHeaders.set('Content-Type', 'application/json');
        }
      }

      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        ...options,
        headers: requestHeaders,
      });

      if (response.status === 401 && !refreshAttempted) {
        console.log('[API Service] Access token expired, attempting refresh');
        accessToken = await this.refreshAccessToken();
        if (accessToken) {
          requestHeaders.set('Authorization', `Bearer ${accessToken}`);
          const retryResponse = await fetch(`${config.apiUrl}${endpoint}`, {
            ...options,
            headers: requestHeaders,
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({ message: retryResponse.statusText }));
            throw new Error(errorData.message || `API request failed: ${retryResponse.statusText}`);
          }

          const responseData = await retryResponse.json();
          return { success: true, data: responseData };
        } else {
          throw new Error('Access token refresh failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API request failed: ${response.statusText}`);
      }

      const responseData = await response.json();
      if (typeof responseData.success === 'boolean' && 'data' in responseData) {
        return responseData;
      }
      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('[API Service] Request error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  auth = {
    login: async (email: string, password: string) => {
      try {
        console.log('[API Service] Attempting login');
        const response = await fetch(`${config.apiUrl}/tennis/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.message || `Login failed: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        return {
          success: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        };
      } catch (error: any) {
        console.error('[API Service] Login error:', error);
        throw error;
      }
    },

    register: async (email: string, password: string) => {
      try {
        console.log('[API Service] ===== REGISTRATION REQUEST =====');
        console.log('[API Service] Email:', email);
        console.log('[API Service] Starting registration');

        const response = await fetch(`${config.apiUrl}/tennis/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        console.log('[API Service] ===== REGISTRATION RESPONSE =====');
        console.log('[API Service] Response OK:', response.ok);
        console.log('[API Service] User from response:', JSON.stringify(data.user, null, 2));

        if (!response.ok) {
          const errorMessage = data.message || `Registration failed: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        return {
          success: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        };
      } catch (error: any) {
        console.error('[API Service] ❌ Registration error:', error);
        throw error;
      }
    },

    googleSignIn: async (idToken: string) => {
      try {
        console.log('[API Service] Attempting Google Sign-In');
        const response = await fetch(`${config.apiUrl}/tennis/auth/google-signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Google Sign-In failed: ${response.statusText}`);
        }

        return data;
      } catch (error: any) {
        console.error('[API Service] Google Sign-In error:', error);
        return {
          success: false,
          error: error.message || 'Google Sign-In failed',
        };
      }
    },

    me: async () => {
      try {
        console.log('[API Service] ===== FETCHING CURRENT USER =====');
        const response = await this.makeRequest('/tennis/auth/me', {
          method: 'GET',
        });

        console.log('[API Service] ===== USER RESPONSE =====');
        console.log('[API Service] Response success:', response.success);
        console.log('[API Service] Full response:', JSON.stringify(response, null, 2));

        // The backend returns { success: true, user: {...} }
        // But makeRequest wraps it in { success: true, data: {...} }
        // So we need to access response.data.user
        const user = response.data?.user || response.user;

        console.log('[API Service] Extracted user:', JSON.stringify(user, null, 2));
        console.log('[API Service] onboarding_completed:', user?.onboarding_completed);
        console.log('[API Service] sport:', user?.sport);
        console.log('[API Service] tennis_level:', user?.tennis_level);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch user');
        }

        return {
          success: true,
          user: user,
        };
      } catch (error: any) {
        console.error('[API Service] ❌ Get user error:', error);
        throw error;
      }
    },
  };

  // Tennis Matches API
  matches = {
    create: async (matchData: {
      opponentName: string;
      matchType: 'singles' | 'doubles';
      result: 'win' | 'loss';
      playerSets: number;
      opponentSets: number;
      sets: Array<{ player: string; opponent: string }>;
      location?: string;
      notes?: string;
      playedAt?: string;
    }) => {
      try {
        console.log('[API Service] Creating match');
        const response = await this.makeRequest('/tennis/matches', {
          method: 'POST',
          body: JSON.stringify(matchData),
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to create match');
        }

        // makeRequest wraps response in { success: true, data: {...} }
        const data = response.data || response;

        return {
          match: data.match,
          stats: data.stats,
        };
      } catch (error: any) {
        console.error('[API Service] Create match error:', error);
        throw error;
      }
    },

    getHistory: async (limit: number = 50, offset: number = 0) => {
      try {
        console.log('[API Service] Fetching match history');
        const response = await this.makeRequest(
          `/tennis/matches?limit=${limit}&offset=${offset}`,
          { method: 'GET' }
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch match history');
        }

        // makeRequest wraps response in { success: true, data: {...} }
        const data = response.data || response;
        
        return {
          matches: data.matches || [],
          count: data.count || 0,
        };
      } catch (error: any) {
        console.error('[API Service] Get match history error:', error);
        throw error;
      }
    },

    getStats: async () => {
      try {
        console.log('[API Service] Fetching user stats');
        const response = await this.makeRequest('/tennis/matches/stats', {
          method: 'GET',
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch stats');
        }

        // makeRequest wraps response in { success: true, data: {...} }
        const data = response.data || response;

        return {
          stats: data.stats || {
            total_matches: 0,
            total_wins: 0,
            total_losses: 0,
            win_rate: 0,
            current_streak: 0,
            longest_win_streak: 0,
            longest_loss_streak: 0,
            last_match_date: null,
          },
        };
      } catch (error: any) {
        console.error('[API Service] Get stats error:', error);
        throw error;
      }
    },

    getById: async (matchId: number) => {
      try {
        console.log('[API Service] Fetching match by ID:', matchId);
        const response = await this.makeRequest(`/tennis/matches/${matchId}`, {
          method: 'GET',
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch match');
        }

        // makeRequest wraps response in { success: true, data: {...} }
        // Backend returns { success: true, match: {...} }
        // So we need to access response.data.match
        const data = response.data || response;
        return data.match || data;
      } catch (error: any) {
        console.error('[API Service] Get match by ID error:', error);
        throw error;
      }
    },

    delete: async (matchId: number) => {
      try {
        console.log('[API Service] Deleting match:', matchId);
        const response = await this.makeRequest(`/tennis/matches/${matchId}`, {
          method: 'DELETE',
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete match');
        }

        return response.data;
      } catch (error: any) {
        console.error('[API Service] Delete match error:', error);
        throw error;
      }
    },
  };

  // Tennis Onboarding API
  onboarding = {
    save: async (onboardingData: {
      sport?: string;
      tennisLevel: string;
      courtPreference: string;
      playingFrequency: string;
      preferredTimes: string[];
    }) => {
      try {
        console.log('[API Service] ===== ONBOARDING SAVE REQUEST =====');
        console.log('[API Service] Saving onboarding data:', JSON.stringify(onboardingData, null, 2));

        const response = await this.makeRequest('/tennis/onboarding', {
          method: 'POST',
          body: JSON.stringify(onboardingData),
        });

        console.log('[API Service] ===== ONBOARDING SAVE RESPONSE =====');
        console.log('[API Service] Response success:', response.success);
        console.log('[API Service] Response data:', JSON.stringify(response.data, null, 2));

        if (!response.success) {
          throw new Error(response.error || 'Failed to save onboarding data');
        }

        return response.data;
      } catch (error: any) {
        console.error('[API Service] ❌ Save onboarding error:', error);
        throw error;
      }
    },

    get: async () => {
      try {
        console.log('[API Service] Fetching onboarding data');
        const response = await this.makeRequest('/tennis/onboarding', {
          method: 'GET',
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch onboarding data');
        }

        return response.data;
      } catch (error: any) {
        console.error('[API Service] Get onboarding error:', error);
        throw error;
      }
    },
  };

  // Tennis User Profile API
  user = {
    updateProfile: async (profileData: {
      full_name?: string;
      bio?: string;
      link?: string;
      sex?: string | null;
      birthday?: string | null;
    }) => {
      try {
        console.log('[API Service] Updating user profile');
        const response = await this.makeRequest('/tennis/user/profile', {
          method: 'PUT',
          body: JSON.stringify(profileData),
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to update profile');
        }

        return response.data || response;
      } catch (error: any) {
        console.error('[API Service] Update profile error:', error);
        throw error;
      }
    },

    uploadProfileImage: async (formData: FormData) => {
      try {
        console.log('[API Service] Uploading profile image');
        const response = await this.makeRequest('/tennis/user/profile-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to upload image');
        }

        return response.data || response;
      } catch (error: any) {
        console.error('[API Service] Upload image error:', error);
        throw error;
      }
    },
  };
}

export const api = new ApiService();

