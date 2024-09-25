import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import GameScreen from './src/screens/GameScreen';
import { SafeAreaView } from 'react-native';
import { theme } from './theme';
const Stack = createStackNavigator();
const App = () => {
  return (
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
            {/* <Stack.Screen name="Auth" component={AuthScreen} /> */}
            <Stack.Screen
              name='Game'
              component={GameScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaView>
  );
};

export default App;
