import Logo from '../../assets/KinoChain.svg';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Loading() {
  return (
    <View style={styles.container}>
      <Logo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
