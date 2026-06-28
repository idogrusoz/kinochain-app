import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import {
  Game,
  ActorModel,
  MovieDetailsModel,
  CreditModel,
  MovieCastModel,
  MovieCrewModel,
  Credit,
  ChainNode,
  Difficulty,
} from '../../types';
import {
  startNewGame,
  fetchMovieDetails,
  fetchActorDetails,
} from '../services/gameService';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import { CreditsList } from '../components/CreditsList';
import { TargetBanner } from '../components/game/TargetBanner';
import { PathTracker } from '../components/game/PathTracker';
import { Wordmark } from '../components/ui/Wordmark';
import { Icon } from '../components/ui/Icon';
import { SectionLabel } from '../components/ui/SectionLabel';
import Loading from '../components/Loading';
import { ErrorScreen } from '../components/ui/ErrorScreen';
import { TmdbError } from '../services/tmdb/client';
import { colors, fonts, spacing } from '../../theme';

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function errorInfo(e: unknown): { title: string; message: string } {
  if (e instanceof TmdbError && e.kind === 'network') {
    return {
      title: "You're offline",
      message: 'Check your internet connection and try again.',
    };
  }
  return {
    title: 'Something went wrong',
    message: "We couldn't load the game. Please try again.",
  };
}

async function ensureOnline() {
  const state = await NetInfo.fetch().catch(() => null);
  if (state?.isConnected === false || state?.isInternetReachable === false) {
    throw new TmdbError('network', 'No internet connection.');
  }
}

// Flatten the model lists into the common Credit row shape used by CreditsList.
function toCredits(
  items: (CreditModel | MovieCastModel | MovieCrewModel)[],
  isActor: boolean
): Credit[] {
  if (isActor) {
    return (items as CreditModel[]).map((c) => ({
      titleId: c.id,
      title: c.title || c.originalTitle,
      poster_path: c.poster,
      name: c.character,
      releaseDate: c.releaseDate,
    }));
  }
  return (items as (MovieCastModel | MovieCrewModel)[]).map((c) => ({
    titleId: c.id,
    title: c.name,
    poster_path: c.poster,
    name: 'character' in c ? c.character : 'job' in c ? c.job : undefined,
    isDirector: 'job' in c,
  }));
}

export default function GameScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const difficulty: Difficulty = route.params?.difficulty ?? 'medium';
  const [game, setGame] = useState<Game | null>(null);
  const [currentItem, setCurrentItem] = useState<
    ActorModel | MovieDetailsModel | null
  >(null);
  const [isActor, setIsActor] = useState(true);
  const [credits, setCredits] = useState<
    (CreditModel | MovieCastModel | MovieCrewModel)[]
  >([]);
  const [path, setPath] = useState<ChainNode[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    title: string;
    message: string;
    retry?: () => void;
  } | null>(null);

  const startAGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await ensureOnline();
      const ng = await startNewGame(difficulty);
      setGame(ng);
      setCurrentItem(ng.starting);
      setCredits(ng.starting.combinedCredits);
      setIsActor(true);
      setPath([
        { kind: 'actor', id: ng.starting.id, name: ng.starting.name, poster: ng.starting.poster },
      ]);
      setSeconds(0);
    } catch (e) {
      console.error('Error starting new game:', e);
      setError(errorInfo(e));
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  useFocusEffect(
    useCallback(() => {
      startAGame();
    }, [startAGame])
  );

  useEffect(() => {
    if (loading || error) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [loading, error]);

  const moves = Math.max(0, path.length - 1);

  // Stable row identity: only rebuilds when the underlying list/state changes —
  // not on every per-second timer tick — so the list doesn't jump to the top.
  const creditRows = useMemo(() => toCredits(credits, isActor), [credits, isActor]);

  const handleCreditSelect = async (creditId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setError(null);
    try {
      if (isActor) {
        // Picking a film. If it's the target, the player wins.
        if (game && game.target.id === creditId) {
          const finalChain: ChainNode[] = [
            ...path,
            {
              kind: 'film',
              id: game.target.id,
              name: game.target.title,
              poster: game.target.poster,
            },
          ];
          navigation.navigate('Winning', {
            targetMovie: game.target,
            moves: moves + 1,
            seconds,
            chain: finalChain,
          });
          return;
        }
        await ensureOnline();
        const movie = await fetchMovieDetails(creditId);
        setCurrentItem(movie);
        // Director(s) first, then the cast.
        setCredits([...movie.crew, ...movie.cast]);
        setIsActor(false);
        setPath((p) => [
          ...p,
          { kind: 'film', id: movie.id, name: movie.title, poster: movie.poster },
        ]);
      } else {
        // Picking a person from a film.
        await ensureOnline();
        const actor = await fetchActorDetails(creditId);
        setCurrentItem(actor);
        setCredits(actor.combinedCredits);
        setIsActor(true);
        setPath((p) => [
          ...p,
          { kind: 'actor', id: actor.id, name: actor.name, poster: actor.poster },
        ]);
      }
    } catch (e) {
      console.error('Error fetching details:', e);
      setError({ ...errorInfo(e), retry: () => handleCreditSelect(creditId) });
    }
  };

  if (error) {
    return (
      <ErrorScreen
        title={error.title}
        message={error.message}
        onRetry={error.retry ?? startAGame}
        onGoBack={() => navigation.goBack()}
      />
    );
  }

  if (loading || !game || !currentItem) return <Loading />;

  const currentName = isActor
    ? (currentItem as ActorModel).name
    : (currentItem as MovieDetailsModel).title;
  const targetYear = game.target.releaseDate
    ? game.target.releaseDate.split('-')[0]
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Wordmark size={17} />
        <Pressable
          onPress={() => navigation.navigate('Onboarding')}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Help"
        >
          <Icon name="help" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <TargetBanner
        title={game.target.title}
        year={targetYear}
        poster={game.target.poster}
      />

      <View style={styles.pathHeader}>
        <SectionLabel>Your path</SectionLabel>
        <Text style={styles.meta} maxFontSizeMultiplier={1.5}>
          Move <Text style={{ color: colors.goldBright }} maxFontSizeMultiplier={1.5}>{moves}</Text> ·{' '}
          {formatTime(seconds)}
        </Text>
      </View>
      <PathTracker path={path} targetPoster={game.target.poster} />
      <Text style={styles.currentLine} numberOfLines={1} maxFontSizeMultiplier={1.5}>
        <Text style={styles.currentName} maxFontSizeMultiplier={1.5}>{currentName}</Text>
        <Text style={styles.currentHint} maxFontSizeMultiplier={1.5}>
          {isActor ? '  —  pick a film' : '  —  pick a person'}
        </Text>
      </Text>

      <View style={styles.listWrap}>
        <CreditsList credits={creditRows} onSelectCredit={handleCreditSelect} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screen,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  navButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
  },
  meta: { fontFamily: fonts.text.regular, fontSize: 11, color: colors.textSecondary },
  currentLine: { textAlign: 'center', marginTop: 8 },
  currentName: { fontFamily: fonts.display.medium, fontSize: 15, color: colors.textPrimary },
  currentHint: { fontFamily: fonts.text.regular, fontSize: 12, color: colors.textSecondary },
  listWrap: { flex: 1, marginTop: 12, marginBottom: 8 },
});
