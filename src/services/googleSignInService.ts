import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Configuration - UPDATE THESE WITH YOUR GOOGLE OAUTH CREDENTIALS
// For now, using CardApp credentials (you can create new ones later)
const GOOGLE_WEB_CLIENT_ID = '22354603271-goaquhal79ct66ebp4vgtpcjgovmb6g8.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '22354603271-5jarcv5opmi5v5l07buuli2fiehrqr8g.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '22354603271-7d06biiqsjq5bv5edgv3jdfv45ohef2f.apps.googleusercontent.com';

interface GoogleUser {
  idToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
}

class GoogleSignInService {
  private isConfigured = false;

  async configure(): Promise<void> {
    try {
      if (this.isConfigured) {
        return;
      }

      console.log('[GOOGLE SIGNIN] Configuring Google Sign-In...');

      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        accountName: '',
        iosClientId: Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : undefined,
      });

      this.isConfigured = true;
      console.log('[GOOGLE SIGNIN] Configuration completed successfully');
    } catch (error) {
      console.error('[GOOGLE SIGNIN] Configuration failed:', error);
      throw error;
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      await this.ensureConfigured();
      const isSignedIn = await GoogleSignin.getCurrentUser();
      return !!isSignedIn;
    } catch (error) {
      console.error('[GOOGLE SIGNIN] Error checking sign-in status:', error);
      return false;
    }
  }

  async signIn(): Promise<GoogleUser> {
    try {
      await this.ensureConfigured();

      console.log('[GOOGLE SIGNIN] Starting sign-in process...');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();
      console.log('[GOOGLE SIGNIN] Sign-in successful');

      const tokens = await GoogleSignin.getTokens();

      const result: GoogleUser = {
        idToken: tokens.idToken,
        user: {
          id: userInfo.data?.user.id || '',
          name: userInfo.data?.user.name || '',
          email: userInfo.data?.user.email || '',
          photo: userInfo.data?.user.photo || undefined,
        },
      };

      return result;
    } catch (error: any) {
      console.error('[GOOGLE SIGNIN] Sign-in failed:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Sign in was cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error('Google sign in failed: ' + error.message);
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.ensureConfigured();
      await GoogleSignin.signOut();
      console.log('[GOOGLE SIGNIN] Sign out successful');
    } catch (error) {
      console.error('[GOOGLE SIGNIN] Sign out failed:', error);
      throw error;
    }
  }

  private async ensureConfigured(): Promise<void> {
    if (!this.isConfigured) {
      await this.configure();
    }
  }
}

export const googleSignInService = new GoogleSignInService();
export type { GoogleUser };

