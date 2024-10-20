import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import i18n from '../i18n/i18n';
import Logo from '../../assets/tmdb-logo.svg';

type RootStackParamList = {
  Game: undefined;
  // Add other screen names here
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const SplashScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Simulate a delay for the splash screen
    setTimeout(() => {
      navigation.navigate('Game');
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KinoChain</Text>
      <View style={styles.footer}>
        <Text style={styles.poweredBy}>{i18n.t('poweredBy')}</Text>
        <Logo width={100} height={50} />
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  // logo: {
  //   width: 100,
  //   height: 50,
  // },
});

export default SplashScreen;
