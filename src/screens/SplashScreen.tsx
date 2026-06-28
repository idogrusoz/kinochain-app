import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mark from '../../assets/kinochain-mark.svg';
import TmdbLogo from '../../assets/tmdb-logo.svg';
import { Wordmark } from '../components/ui/Wordmark';
import { RootStackParamList } from '../../App';
import { colors, fonts } from '../../theme';

export const ONBOARDED_KEY = 'kinochain.onboarded';

export default function SplashScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(async () => {
      let onboarded = false;
      try {
        onboarded = (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
      } catch {
        onboarded = false;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: onboarded ? 'Welcome' : 'Onboarding' }],
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Mark width={104} height={104} />
        <Wordmark size={24} letterSpacing={1.5} />
        <Text style={styles.tagline} maxFontSizeMultiplier={1.5}>SIX DEGREES OF CINEMA</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.powered} maxFontSizeMultiplier={1.5}>POWERED BY</Text>
        <TmdbLogo width={58} height={42} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  tagline: {
    fontFamily: fonts.text.medium,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  footer: { alignItems: 'center', gap: 6, paddingBottom: 28 },
  powered: { fontFamily: fonts.text.medium, fontSize: 10, letterSpacing: 1, color: colors.textSecondary },
});
