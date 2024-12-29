import React, { Suspense, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GameScreen from './src/screens/GameScreen';
import { WinningScreen } from './src/screens/WinningScreen';
import SplashScreen from './src/screens/SplashScreen';
import { AppState, SafeAreaView } from 'react-native';
import { theme } from './theme';
import { MovieSummaryModel } from './types';
import AuthScreen from './src/screens/AuthScreen';
import { getSecureItem } from './src/services/storageService';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Define the types for your navigation stack
export type RootStackParamList = {
  Splash: undefined;
  Game: undefined;
  Winning: { targetMovie: MovieSummaryModel };
  Auth: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Replace this with your actual authentication check logic
        const authToken = await getSecureItem('authToken');
        setIsAuthenticated(authToken !== null);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

 const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // Re-check auth when app comes to foreground
        checkAuthStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);


  return (
    <Suspense fallback={null}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName='Splash'
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen
                name='Splash'
                component={SplashScreen}
              />
              <Stack.Screen
                name='Auth'
                component={AuthScreen}
              />
              <Stack.Screen
                name='Game'
                component={GameScreen}
              />
              <Stack.Screen
                name='Winning'
                component={WinningScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Suspense>
  );
};

export default App;
