// ==========================================
// IMPORTS & CONFIGURATION
// ==========================================
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import axios from 'axios';

const BACKEND_BASE_URL = 'https://mug-work-public.ngrok-free.dev/api/auth';

GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com', 
  offlineAccess: true,
});

// ==========================================
// 1. GOOGLE & FACEBOOK SDK AUTH
// ==========================================
/**
 * Triggers Google Sign-In and returns the user's ID token.
 */
export const getGoogleIdToken = async (): Promise<string> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response: any = await GoogleSignin.signIn();
    const idToken = response.idToken || response.data?.idToken;
    
    if (!idToken) {
      throw new Error('Google Sign-In succeeded, but ID token is missing.');
    }
    return idToken;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Triggers Facebook Login and returns the user's access token.
 */
export const getFacebookAccessToken = async (): Promise<string> => {
  try {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    if (result.isCancelled) {
      throw new Error('User cancelled Facebook login.');
    }

    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw new Error('Failed to retrieve Facebook Access Token.');
    }
    return data.accessToken.toString();
  } catch (error: any) {
    console.error('Facebook Sign-In Error:', error);
    throw error;
  }
};

// ==========================================
// 2. BACKEND OAUTH INTEGRATION
// ==========================================
/**
 * Sends the Google ID token to the backend server to authenticate.
 */
export const loginWithGoogleBackend = async (idToken: string, role: string) => {
  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/google`, {
      idToken,
      role
    }, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return response.data;
  } catch (error: any) {
    console.error('Backend Google Auth Error:', error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Sends the Facebook access token to the backend server to authenticate.
 */
export const loginWithFacebookBackend = async (accessToken: string, role: string) => {
  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/facebook`, {
      accessToken,
      role
    }, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return response.data;
  } catch (error: any) {
    console.error('Backend Facebook Auth Error:', error?.response?.data || error.message);
    throw error;
  }
};
