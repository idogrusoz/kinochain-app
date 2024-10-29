import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';

export const signInWithApple = async () => {
  try {
    if (!AppleAuthentication.isAvailableAsync()) {
      throw new Error('Apple authentication is not available on this device');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Handle the sign-in response here
    console.log(credential);

    return credential;
  } catch (error) {
    console.error('Detailed Apple Sign-In Error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: 'YOUR_EXPO_CLIENT_ID',
      iosClientId: 'YOUR_IOS_CLIENT_ID',
      androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    });

    if (response?.type === 'success' && response.authentication) {
      // Send the token to your backend and get user data
      // const userData = await getUserData(response.authentication.accessToken);
      // return userData;
    }
    throw new Error('Google sign-in failed');
  } catch (error) {
    throw error;
  }
};
