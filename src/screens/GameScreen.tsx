import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
} from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import type {
  Game,
  ActorModel,
  MovieDetailsModel,
  CreditModel,
  MovieCastModel,
  MovieCrewModel,
  Credit,
} from '../../types';
import { startNewGame } from '../services/gameService';
import { CreditsList } from '../components/CreditsList';
import i18n from '../i18n/i18n';
import { theme } from '../../theme';
import { fetchMovieDetails, fetchActorDetails } from '../services/gameService';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useFocusEffect } from '@react-navigation/native';
import Loading from '../components/Loading';

export default function GameScreen() {
  const [game, setGame] = useState<Game | null>(null);
  const [currentItem, setCurrentItem] = useState<
    ActorModel | MovieDetailsModel | null
  >(null);
  const [isActor, setIsActor] = useState<boolean>(true);
  const [credits, setCredits] = useState<
    (CreditModel | MovieCastModel | MovieCrewModel)[]
  >([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const resetGame = useCallback(() => {
    startAGame();
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetGame();
    }, [resetGame])
  );

  useEffect(() => {
    startAGame();
  }, []);

  const startAGame = async () => {
    try {
      const newGame = await startNewGame();
      setGame(newGame);
      setCurrentItem(newGame.starting);
      setCredits(newGame.starting.combinedCredits);
      setIsActor(true);
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  const handleCreditSelect = async (creditId: number) => {
    try {
      if (isActor) {
        const movieDetails = await fetchMovieDetails(creditId);
        setCurrentItem(movieDetails);
        setCredits([...movieDetails.cast, ...movieDetails.crew]);
        setIsActor(false);

        // Check if the game is won
        if (game?.target.id === creditId) {
          navigation.navigate('Winning', { targetMovie: game.target });
        }
      } else {
        const actorDetails = await fetchActorDetails(creditId);
        setCurrentItem(actorDetails);
        setCredits(actorDetails.combinedCredits);
        setIsActor(true);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const renderCurrentItem = () => {
    if (!currentItem) return null;

    const title = isActor
      ? (currentItem as ActorModel).name
      : (currentItem as MovieDetailsModel).title;
    const posterPath = isActor
      ? (currentItem as ActorModel).poster
      : (currentItem as MovieDetailsModel).poster;

    return (
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{i18n.t('current')}</Text>
        </View>
        <Card style={{ backgroundColor: theme.background }}>
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
                  flex: 1,
                  wordWrap: 'break-word',
                }}
              >
                {title}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </>
    );
  };

  const mapCreditsToCommonFormat = (
    credits: (CreditModel | MovieCastModel | MovieCrewModel)[]
  ): Credit[] => {
    if (isActor) {
      return (credits as CreditModel[]).map((credit) => ({
        titleId: credit.id,
        title: credit.title || credit.originalTitle,
        poster_path: credit.poster,
        name: credit.character,
        releaseDate: credit.releaseDate,
      }));
    } else {
      return (credits as MovieCastModel[] | MovieCrewModel[]).map((credit) => ({
        titleId: credit.id,
        title: credit.name,
        name:
          'character' in credit
            ? credit.character
            : 'job' in credit
            ? credit.job
            : undefined,
        poster_path:
          'poster' in credit
            ? credit.poster
            : (credit as MovieCrewModel).poster,
        releaseDate:
          'releaseDate' in credit ? (credit.releaseDate as string) : undefined,
      }));
    }
  };

  return !game || !currentItem ? (
    <Loading />
  ) : (
    <View style={styles.container}>
      {/* Target Movie Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{i18n.t('target')}</Text>
      </View>
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
          <Text style={styles.targetYear}>
            {game.target.releaseDate.split('-')[0]}
          </Text>
        </View>
      </View>

      {/* Current Item Section */}
      {renderCurrentItem()}

      {/* Credits List */}
      <View style={styles.content}>
        <CreditsList
          credits={mapCreditsToCommonFormat(credits)}
          onSelectCredit={handleCreditSelect}
        />
      </View>
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
    flex: 1,
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
    marginLeft: 16,
  },
  targetInfo: {
    marginLeft: 16,
  },
  targetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    flexWrap: 'wrap',
    width: 300,
  },
  targetYear: {
    fontSize: 14,
    color: theme.text,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    padding: 4,
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: theme.primary,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});
