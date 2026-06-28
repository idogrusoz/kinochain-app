import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';
import { BrassButton } from '../components/ui/BrassButton';
import { TextButton } from '../components/ui/TextButton';
import { Icon, IconName } from '../components/ui/Icon';
import { ONBOARDED_KEY } from './SplashScreen';
import { colors, fonts, type } from '../../theme';

type Step = { title: string; body: string; icon: IconName };

const STEPS: Step[] = [
  { title: 'Your goal', body: 'Reach the target film by linking actors and the movies they’re in.', icon: 'flag' },
  { title: 'Make a move', body: 'Tap any film the current actor starred in to hop to it.', icon: 'film' },
  { title: 'Pick a person', body: 'Then choose a co-star — or the director — from that film.', icon: 'person' },
  { title: 'Keep the chain going', body: 'Alternate actor and film until you reach the target. Fewer moves win.', icon: 'swap' },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(0);
  const openedFromApp = navigation.canGoBack();
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      // ignore — onboarding will simply show again next launch
    }
    if (openedFromApp) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.skipRow, openedFromApp && styles.backRow]}>
        <TextButton label={openedFromApp ? 'Back' : 'Skip'} onPress={finish} />
      </View>

      <View style={styles.hero}>
        <View style={styles.spotlight}>
          <Icon name={current.icon} size={40} color={colors.goldBright} />
        </View>
        <Text style={[type.titleHero, styles.title]} maxFontSizeMultiplier={1.5}>{current.title}</Text>
        <Text style={styles.body} maxFontSizeMultiplier={1.5}>{current.body}</Text>
      </View>

      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === step ? colors.goldBright : colors.borderSubtleGold }]}
          />
        ))}
      </View>

      <BrassButton
        label={isLast ? 'Got it' : 'Next'}
        onPress={() => (isLast ? finish() : setStep((s) => s + 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 22, paddingBottom: 22 },
  skipRow: { alignItems: 'flex-end', paddingVertical: 10 },
  backRow: { alignItems: 'flex-start' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  spotlight: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: colors.goldTintBg,
    borderWidth: 2,
    borderColor: colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.textPrimary, textAlign: 'center' },
  body: {
    fontFamily: fonts.text.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSoft,
    textAlign: 'center',
    maxWidth: 280,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
