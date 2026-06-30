import React, { Suspense, useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import GameScreen from './src/screens/GameScreen';
import { WinningScreen } from './src/screens/WinningScreen';
import AboutScreen from './src/screens/AboutScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import { theme } from './theme';
import { MovieSummaryModel, ChainNode, Difficulty } from './types';
import { initAnalytics, track } from './src/services/analytics';

ExpoSplashScreen.preventAutoHideAsync();
initAnalytics();

// Navigation stack: Splash routes to Onboarding (first run) or Welcome; Welcome
// starts a Game; finishing a Game shows Winning.
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Game: { difficulty?: Difficulty } | undefined;
  Winning: {
    targetMovie: MovieSummaryModel;
    moves: number;
    seconds: number;
    chain: ChainNode[];
    fromTutorial?: boolean;
    hintUsed?: boolean;
  };
  About: undefined;
  Privacy: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    track('app_open');
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <PaperProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName='Splash'
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name='Splash' component={SplashScreen} />
                <Stack.Screen name='Onboarding' component={OnboardingScreen} />
                <Stack.Screen name='Welcome' component={WelcomeScreen} />
                <Stack.Screen name='Game' component={GameScreen} />
                <Stack.Screen name='Winning' component={WinningScreen} />
                <Stack.Screen name='About' component={AboutScreen} />
                <Stack.Screen name='Privacy' component={PrivacyScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Suspense>
  );
};

export default App;
