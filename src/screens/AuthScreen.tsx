import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { signInWithApple, signInWithGoogle } from '../services/authService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Game: undefined;
  // Add other screen names and their params here
};

const AuthScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleAppleSignIn = async () => {
    try {
      const user = await signInWithApple();
      navigation.replace('Game');
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
    }
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
    <View style={styles.container}>
      {Platform.OS === 'ios' && <Button mode="contained" onPress={handleAppleSignIn} style={styles.button}>
        Sign in with Apple
      </Button>}
      <Button mode="contained" onPress={handleGoogleSignIn} style={styles.button}>
        Sign in with Google
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    marginVertical: 10,
    width: '100%',
  },
});

export default AuthScreen;
