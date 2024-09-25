import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { useState, useEffect } from 'react';
import type { Game, ActorModel, CreditModel } from '../../types';
import { startNewGame } from '../services/gameService';
import { CreditsList } from '../components/CreditsList';
import i18n from '../i18n/i18n';
import { theme } from '../../theme';

export default function GameScreen() {
  const [game, setGame] = useState<Game | null>(null);
  const [currentActor, setCurrentActor] = useState<ActorModel | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const newGame = await startNewGame();
        setGame(newGame);
        setCurrentActor(newGame.starting);
      } catch (error) {
        console.error('Error starting new game:', error);
      }
    };

    fetchGame();
  }, []);

  return !game || !currentActor ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{i18n.t('loading')}</Text>
    </View>
  ) : (
    <View style={styles.container}>
        {/* Target Movie Section */}
        <View
          style={{
            backgroundColor: theme.secondary,
            padding: 8,

            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{
                uri: game?.target.poster
                  ? `https://image.tmdb.org/t/p/w200${game.target.poster}`
                  : '/placeholder.svg',
                }}
              style={{
                width: 80,
                height: 120,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: '#FFF176',
              }}
            />
            <View style={{ marginLeft: 16 }}>
              <Text style={{ fontSize: 18, color: '#FFF176' }}>
                {game?.target.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#FFF176' }}>
                {game?.target.releaseDate.split('-')[0]}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Actor Section */}
        <Card style={{ margin: 16, backgroundColor: '#FFF9C4' }}>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Image
                source={{
                  uri: currentActor?.poster
                    ? `https://image.tmdb.org/t/p/w200${currentActor.poster}`
                    : '/placeholder.svg',
                  }}
                style={{ width: 96, height: 96, borderRadius: 8 }}
              />
              <Text style={{ fontSize: 20, marginLeft: 16 }}>
                {currentActor?.name}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Credits List */}
        <ScrollView contentContainerStyle={styles.content}> 
        <CreditsList
          credits={
            currentActor?.combinedCredits?.map((credit) => ({
              ...credit,
              titleId: credit.id,
              poster_path: credit.poster,
            })) || []
          }
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 40, // Adjust this value as needed
    paddingBottom: 10,
    // Add any other styles for your header
  },
  content: {
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.primary,
  },
});
