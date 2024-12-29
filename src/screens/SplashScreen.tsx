import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Logo from '../../assets/KinoChain.svg';
import TmdbLogo from '../../assets/tmdb-logo.svg';
import i18n from '../i18n/i18n';


type RootStackParamList = {
  Auth: undefined;
  // Add other screen names here
};

const { width: screenWidth } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Simulate a delay for the splash screen
    setTimeout(() => {
      
      navigation.navigate('Auth'); //TODO check that app is ready``
    }, 3000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Logo width={screenWidth} />
      <View style={styles.footer}>
        <Text style={styles.poweredBy}>{i18n.t('poweredBy')}</Text>
        <TmdbLogo
          width={100}
          height={50}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  logo: {
    width: '100%',
  },
});

export default SplashScreen;
