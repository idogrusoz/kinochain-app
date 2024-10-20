import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; // Import this to define route prop

const { width, height } = Dimensions.get('window');

// Define the expected route props for WinningScreen
export type WinningScreenProps = StackScreenProps<
  RootStackParamList,
  'Winning'
>;

export const WinningScreen: React.FC<WinningScreenProps> = ({ route, navigation }) => {
  const { targetMovie } = route.params; // Destructure targetMovie from route params

  const handleStartNewGame = () => {
    // Navigate to the screen where a new game starts
    navigation.navigate('Game'); // Replace 'Home' with your actual starting screen name
  };

  return (
    <ImageBackground
      source={{
        uri: targetMovie.poster
          ? `https://image.tmdb.org/t/p/original${targetMovie.poster}`
          : '/placeholder.svg',
      }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text style={styles.winTitle}>{targetMovie.title}</Text>
          <Text style={styles.winText}>Cinematic Genius!</Text>
          <Text style={styles.winSubtext}>
            Your movie knowledge is Oscar-worthy!
          </Text>
          <TouchableOpacity
            style={styles.newGameButton}
            onPress={handleStartNewGame}
          >
            <Text style={styles.newGameButtonText}>Start New Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    alignItems: 'center',
  },
  winTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.text,
    marginBottom: 20,
  },
  winText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'gold',
    textAlign: 'center',
    marginBottom: 10,
  },
  winSubtext: {
    fontSize: 18,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  newGameButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  newGameButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
