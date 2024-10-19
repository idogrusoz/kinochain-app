import React from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { MovieSummaryModel } from '../../types';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

interface WinningScreenProps {
  targetMovie: MovieSummaryModel;
  fadeAnim: Animated.Value;
  moveAnim: Animated.Value;
}

export const WinningScreen: React.FC<WinningScreenProps> = ({ targetMovie, fadeAnim, moveAnim }) => {
  return (
    <Animated.View 
      style={[
        styles.winOverlay, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: moveAnim }]
        }
      ]}
    >
      <View style={styles.winCard}>
        <Image
          source={{
            uri: targetMovie.poster
              ? `https://image.tmdb.org/t/p/w300${targetMovie.poster}`
              : '/placeholder.svg',
          }}
          style={styles.winPoster}
        />
        <Text style={styles.winTitle}>{targetMovie.title}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.winText}>Cinematic Genius!</Text>
        <Text style={styles.winSubtext}>Your movie knowledge is Oscar-worthy!</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  winCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.7,
    aspectRatio: 2 / 3,
  },
  winPoster: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  winTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.text,
    marginTop: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
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
  },
});
