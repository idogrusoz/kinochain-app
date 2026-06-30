import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';
import {
  ActorModel,
  MovieDetailsModel,
  ChainNode,
  Credit,
  CreditModel,
  MovieCastModel,
  MovieCrewModel,
  MediaType,
} from '../../types';
import { fetchMovieDetails, fetchActorDetails } from '../services/gameService';
import { BrassButton } from '../components/ui/BrassButton';
import { TextButton } from '../components/ui/TextButton';
import { Icon } from '../components/ui/Icon';
import { SectionLabel } from '../components/ui/SectionLabel';
import { Surface } from '../components/ui/Surface';
import { Wordmark } from '../components/ui/Wordmark';
import { TargetBanner } from '../components/game/TargetBanner';
import { PathTracker } from '../components/game/PathTracker';
import { CreditsList } from '../components/CreditsList';
import Loading from '../components/Loading';
import { ONBOARDED_KEY } from './SplashScreen';
import { colors, fonts, type, spacing } from '../../theme';
import i18n, { useLocale } from '../i18n/i18n';

// ── Tutorial path (hardcoded TMDB IDs) ─────────────────────────────────
// Jamie Foxx → Django Unchained → Leonardo DiCaprio → Inception

const TUTORIAL = {
  startActorId: 134,       // Jamie Foxx
  movie1Id: 68718,         // Django Unchained
  hopActorId: 6193,        // Leonardo DiCaprio
  targetMovieId: 27205,    // Inception
  targetTitle: 'Inception',
  targetYear: '2010',
  targetPoster: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
} as const;

// Coach-mark overlays for each phase of the guided tutorial.
type CoachPhase = 'goal' | 'pick-film' | 'pick-person' | 'pick-target';

function getCoach(phase: CoachPhase): { title: string; body: string } {
  switch (phase) {
    case 'goal':
      return { title: i18n.t('onboarding.goalTitle'), body: i18n.t('onboarding.goalBody') };
    case 'pick-film':
      return { title: i18n.t('onboarding.pickFilmTitle'), body: i18n.t('onboarding.pickFilmBody', { filmName: 'Django Unchained' }) };
    case 'pick-person':
      return { title: i18n.t('onboarding.pickPersonTitle'), body: i18n.t('onboarding.pickPersonBody', { personName: 'Leonardo DiCaprio' }) };
    case 'pick-target':
      return { title: i18n.t('onboarding.pickTargetTitle'), body: i18n.t('onboarding.pickTargetBody', { filmName: 'Inception' }) };
  }
}

// ── Helper: flatten model lists to CreditsList row shape ───────────────

function toCredits(
  items: (CreditModel | MovieCastModel | MovieCrewModel)[],
  isActor: boolean,
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

// ── Main component ─────────────────────────────────────────────────────

export default function OnboardingScreen() {
  useLocale();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const openedFromApp = navigation.canGoBack();

  // Data fetched from TMDB
  const [startActor, setStartActor] = useState<ActorModel | null>(null);
  const [movie1, setMovie1] = useState<MovieDetailsModel | null>(null);
  const [hopActor, setHopActor] = useState<ActorModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Tutorial state
  const [phase, setPhase] = useState<CoachPhase>('goal');
  const [currentItem, setCurrentItem] = useState<ActorModel | MovieDetailsModel | null>(null);
  const [isActor, setIsActor] = useState(true);
  const [path, setPath] = useState<ChainNode[]>([]);

  // Fetch all tutorial data upfront
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [actor, movie, actor2] = await Promise.all([
          fetchActorDetails(TUTORIAL.startActorId),
          fetchMovieDetails(TUTORIAL.movie1Id),
          fetchActorDetails(TUTORIAL.hopActorId),
        ]);
        if (cancelled) return;
        setStartActor(actor);
        setMovie1(movie);
        setHopActor(actor2);
        setCurrentItem(actor);
        setPath([{ kind: 'actor', id: actor.id, name: actor.name, poster: actor.poster }]);
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const finish = useCallback(async () => {
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
  }, [navigation, openedFromApp]);

  // The allowed credit ID for the current phase
  const allowedId = useMemo(() => {
    switch (phase) {
      case 'pick-film': return TUTORIAL.movie1Id;
      case 'pick-person': return TUTORIAL.hopActorId;
      case 'pick-target': return TUTORIAL.targetMovieId;
      default: return null;
    }
  }, [phase]);

  const handleCreditSelect = useCallback(
    (creditId: number) => {
      if (allowedId !== null && creditId !== allowedId) return;

      if (phase === 'pick-film' && movie1) {
        setCurrentItem(movie1);
        setIsActor(false);
        setPath((p) => [
          ...p,
          { kind: 'film', id: movie1.id, name: movie1.title, poster: movie1.poster },
        ]);
        setPhase('pick-person');
      } else if (phase === 'pick-person' && hopActor) {
        setCurrentItem(hopActor);
        setIsActor(true);
        setPath((p) => [
          ...p,
          { kind: 'actor', id: hopActor.id, name: hopActor.name, poster: hopActor.poster },
        ]);
        setPhase('pick-target');
      } else if (phase === 'pick-target') {
        const finalChain: ChainNode[] = [
          ...path,
          {
            kind: 'film',
            id: TUTORIAL.targetMovieId,
            name: TUTORIAL.targetTitle,
            poster: TUTORIAL.targetPoster,
          },
        ];
        // Mark onboarding as done before navigating to the win screen
        AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
        navigation.reset({
          index: 0,
          routes: [
            { name: 'Welcome' },
            {
              name: 'Winning',
              params: {
                targetMovie: {
                  id: TUTORIAL.targetMovieId,
                  title: TUTORIAL.targetTitle,
                  originalTitle: TUTORIAL.targetTitle,
                  poster: TUTORIAL.targetPoster,
                  releaseDate: TUTORIAL.targetYear,
                  mediaType: MediaType.Movie,
                },
                moves: 3,
                seconds: 0,
                chain: finalChain,
                fromTutorial: true,
              },
            },
          ],
        });
      }
    },
    [phase, movie1, hopActor, allowedId, finish],
  );

  // Build the credits list for the current view
  const creditRows = useMemo(() => {
    if (!currentItem) return [];
    if (isActor) {
      return toCredits((currentItem as ActorModel).combinedCredits, true);
    }
    const m = currentItem as MovieDetailsModel;
    return toCredits([...m.crew, ...m.cast], false);
  }, [currentItem, isActor]);

  const coach = getCoach(phase);

  const currentName = currentItem
    ? isActor
      ? (currentItem as ActorModel).name
      : (currentItem as MovieDetailsModel).title
    : '';

  const targetYear = TUTORIAL.targetYear;

  // ── Loading / error states ───────────────────────────────────────────

  if (loading) return <Loading label={i18n.t('onboarding.preparing')} />;

  if (fetchError || !startActor) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCenter}>
          <Icon name="warning" size={40} color={colors.gold} />
          <Text style={[type.titleHero, { color: colors.textPrimary, marginTop: 16, textAlign: 'center' }]}>
            {i18n.t('onboarding.errorTitle')}
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
            {i18n.t('onboarding.errorBody')}
          </Text>
          <View style={{ marginTop: 24, width: '100%' }}>
            <BrassButton label={i18n.t('onboarding.skipForNow')} onPress={finish} />
          </View>
        </View>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Nav bar */}
      <View style={styles.nav}>
        <View style={styles.navButton} />
        <Wordmark size={17} />
        <Pressable
          onPress={finish}
          hitSlop={8}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={openedFromApp ? i18n.t('onboarding.goBackA11y') : i18n.t('onboarding.skipA11y')}
        >
          <TextButton label={openedFromApp ? i18n.t('onboarding.back') : i18n.t('onboarding.skip')} onPress={finish} />
        </Pressable>
      </View>

      {/* Target banner */}
      <TargetBanner
        title={TUTORIAL.targetTitle}
        year={targetYear}
        poster={TUTORIAL.targetPoster}
      />

      {/* Path tracker */}
      <View style={styles.pathHeader}>
        <SectionLabel>{i18n.t('onboarding.yourPath')}</SectionLabel>
      </View>
      <PathTracker path={path} targetPoster={TUTORIAL.targetPoster} />
      <Text style={styles.currentLine} numberOfLines={1} maxFontSizeMultiplier={1.5}>
        <Text style={styles.currentName} maxFontSizeMultiplier={1.5}>{currentName}</Text>
        <Text style={styles.currentHint} maxFontSizeMultiplier={1.5}>
          {'  —  '}{isActor ? i18n.t('onboarding.pickFilm') : i18n.t('onboarding.pickPerson')}
        </Text>
      </Text>

      {/* Coach-mark overlay card */}
      <View style={styles.coachCard}>
        <Text style={styles.coachTitle}>{coach.title}</Text>
        <Text style={styles.coachBody}>{coach.body}</Text>
        {phase === 'goal' && (
          <View style={{ marginTop: 12 }}>
            <BrassButton label={i18n.t('onboarding.letsGo')} onPress={() => setPhase('pick-film')} />
          </View>
        )}
      </View>

      {/* Credits list — only shown after goal phase */}
      {phase !== 'goal' && (
        <View style={styles.listWrap}>
          <CreditsList
            credits={creditRows}
            onSelectCredit={handleCreditSelect}
            highlightId={allowedId ?? undefined}
          />
        </View>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

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
  currentLine: { textAlign: 'center', marginTop: 8 },
  currentName: { fontFamily: fonts.display.medium, fontSize: 15, color: colors.textPrimary },
  currentHint: { fontFamily: fonts.text.regular, fontSize: 12, color: colors.textSecondary },
  coachCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldBright,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  coachTitle: {
    fontFamily: fonts.display.semibold,
    fontSize: 17,
    color: colors.goldBright,
    marginBottom: 4,
  },
  coachBody: {
    fontFamily: fonts.text.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSoft,
  },
  listWrap: { flex: 1, marginTop: 12, marginBottom: 8 },
  errorCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
