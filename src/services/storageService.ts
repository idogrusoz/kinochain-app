import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For sensitive data
export const setSecureItem = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

export const getSecureItem = async (key: string) => {
  return await SecureStore.getItemAsync(key);
};

export const removeSecureItem = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

// For non-sensitive data
export const setItem = async (key: string, value: string) => {
  await AsyncStorage.setItem(key, value);
};

export const getItem = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

export const removeItem = async (key: string) => {
  await AsyncStorage.removeItem(key);
};

