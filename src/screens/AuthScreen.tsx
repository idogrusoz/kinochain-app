import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithGoogle } from '../services/authService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppleAuthenticationCredential } from 'expo-apple-authentication';
import { getSecureItem, setItem, setSecureItem } from '../services/storageService';
import { theme } from '../../theme';

type RootStackParamList = {
  Game: undefined;
  // Add other screen names and their params here
};

const AuthScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    const checkAuth = async () => {
      const authToken = await getSecureItem('authToken');
      if (authToken) {
        navigation.navigate('Game');
      }
    };
    checkAuth();
  }, []);

  const handleAppleSignIn = async (credential: AppleAuthenticationCredential) => {
    // Implement your Apple sign-in logic here
    console.log('Signed in with Apple:', credential);
    // Store the auth token securely
    if (credential.identityToken) {
      await setSecureItem('authToken', credential.identityToken);
    }
    
    // Store the user ID (non-sensitive) in AsyncStorage
    await setItem('userId', credential.user);
    // Navigate to the next screen or update app state
    navigation.replace('Game');
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      navigation.replace('Game');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  return (
    Platform.OS === 'ios' &&
<View style={styles.container}>
  
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        cornerRadius={5}
        style={styles.button}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            console.log('credential', credential);
            handleAppleSignIn(credential);
          } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
              // handle that the user canceled the sign-in flow
            } else {
              // handle other errors
            }
          }
        }}
      />
    </View> // TODO add google sign in
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  button: {
    width: 200,
    height: 44,
  },
});

export default AuthScreen;
