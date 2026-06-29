import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wordmark } from './Wordmark';
import { BrassButton } from './BrassButton';
import { OutlineButton } from './OutlineButton';
import { Icon } from './Icon';
import { colors, fonts, spacing } from '../../../theme';
import i18n from '../../i18n/i18n';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
};

export function ErrorScreen({
  title = i18n.t('error.title'),
  message = i18n.t('error.body'),
  onRetry,
  onGoBack,
}: Props) {
  return (
    <View style={styles.container}>
      <View
        style={styles.content}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`${title}. ${message}`}
      >
        <Wordmark size={20} />
        <View style={styles.iconWrap}>
          <Icon name="warning" size={40} color={colors.error} />
        </View>
        <Text style={styles.title} maxFontSizeMultiplier={1.5}>{title}</Text>
        <Text style={styles.message} maxFontSizeMultiplier={1.5}>{message}</Text>
      </View>
      <View style={styles.actions}>
        {onRetry && <BrassButton label={i18n.t('error.tryAgain')} onPress={onRetry} />}
        {onGoBack && (
          <OutlineButton
            label={i18n.t('error.goBack')}
            icon="back"
            onPress={onGoBack}
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screen,
    justifyContent: 'center',
  },
  content: { alignItems: 'center', gap: 14 },
  iconWrap: { marginTop: 24, marginBottom: 4 },
  title: {
    fontFamily: fonts.display.semibold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.text.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: { marginTop: 36, paddingBottom: 40 },
});
