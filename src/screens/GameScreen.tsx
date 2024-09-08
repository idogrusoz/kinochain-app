import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { startNewGame } from '../services/gameService';

const GameScreen = () => {
  const handleStartNewGame = async () => {
    try {
      const gameData = await startNewGame();
      // Handle the new game data, e.g., navigate to a game play screen
      console.log('New game started:', gameData);
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={handleStartNewGame}>
        Start New Game
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default GameScreen;
