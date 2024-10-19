import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Card } from 'react-native-paper';
import type { Game, ActorModel, MovieDetailsModel, CreditModel, MovieCastModel, MovieCrewModel, Credit } from '../../types';
import { startNewGame } from '../services/gameService';
import { CreditsList } from '../components/CreditsList';
import i18n from '../i18n/i18n';
import { theme } from '../../theme';
import { fetchMovieDetails, fetchActorDetails } from '../services/gameService';

export default function GameScreen() {
  const [game, setGame] = useState<Game | null>(null);
  const [currentItem, setCurrentItem] = useState<ActorModel | MovieDetailsModel | null>(null);
  const [isActor, setIsActor] = useState<boolean>(true);
  const [credits, setCredits] = useState<(CreditModel | MovieCastModel | MovieCrewModel)[]>([]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const newGame = await startNewGame();
        setGame(newGame);
        setCurrentItem(newGame.starting);
        setCredits(newGame.starting.combinedCredits);
      } catch (error) {
        console.error('Error starting new game:', error);
      }
    };

    fetchGame();
  }, []);

  const handleCreditSelect = async (creditId: number) => {
    try {
      if (isActor) {
        const movieDetails = await fetchMovieDetails(creditId);
        setCurrentItem(movieDetails);
        setCredits([...movieDetails.cast, ...movieDetails.crew]);
        setIsActor(false);
      } else {
        const actorDetails = await fetchActorDetails(creditId);
        setCurrentItem(actorDetails);
        setCredits(actorDetails.combinedCredits);
        setIsActor(true);
      }

      // Check if the game is won
      if (!isActor && game?.target.id === creditId) {
        // Handle game win
        console.log('Game won!');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const renderCurrentItem = () => {
    if (!currentItem) return null;

    const title = isActor ? (currentItem as ActorModel).name : (currentItem as MovieDetailsModel).title;
    const posterPath = isActor ? (currentItem as ActorModel).poster : (currentItem as MovieDetailsModel).poster;

    return (
      <Card style={{ margin: 16, backgroundColor: theme.background }}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Image
              source={{
                uri: posterPath
                  ? `https://image.tmdb.org/t/p/w185${posterPath}`
                  : '/placeholder.svg',
              }}
              style={{ width: 96, height: 96, borderRadius: 8 }}
            />
            <Text
              style={{
                fontSize: 20,
                marginLeft: 16,
                color: theme.text,
                flexWrap: 'wrap',
                width: 300,
              }}
            >
              {title}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const mapCreditsToCommonFormat = (credits: (CreditModel | MovieCastModel | MovieCrewModel)[]): Credit[] => {
    return credits.map(credit => ({
      titleId: credit.id,
      title: 'title' in credit ? credit.title : credit.name,
      name: 'name' in credit ? credit.name : undefined,
      poster_path: 'poster' in credit ? credit.poster : (credit as MovieCrewModel).poster,
      releaseDate: 'releaseDate' in credit ? credit.releaseDate : undefined,
    }));
  };

  return !game || !currentItem ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{i18n.t('loading')}</Text>
    </View>
  ) : (
    <View style={styles.container}>
      {/* Target Movie Section */}
      <View style={styles.targetSection}>
        <Image
          source={{
            uri: game.target.poster
              ? `https://image.tmdb.org/t/p/w200${game.target.poster}`
              : '/placeholder.svg',
          }}
          style={styles.targetPoster}
        />
        <View style={styles.targetInfo}>
          <Text style={styles.targetTitle}>{game.target.title}</Text>
          <Text style={styles.targetYear}>{game.target.releaseDate.split('-')[0]}</Text>
        </View>
      </View>

      {/* Current Item Section */}
      {renderCurrentItem()}

      {/* Credits List */}
      <ScrollView contentContainerStyle={styles.content}>
        <CreditsList
          credits={mapCreditsToCommonFormat(credits)}
          onSelectCredit={handleCreditSelect}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
  targetSection: {
    backgroundColor: theme.background,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetPoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
  },
  targetInfo: {
    marginLeft: 16,
  },
  targetTitle: {
    fontSize: 16,
    color: theme.text,
    flexWrap: 'wrap',
    width: 300,
  },
  targetYear: {
    fontSize: 14,
    color: theme.text,
  },
});
