import { Game, CreditModel, Difficulty } from '../../../types';
import { fetchMovie, getMovieDetails } from './movieService';
import {
  fetchActorFromMovie,
  getCombinedCreditsOfAnActor,
  getActorDetails,
} from './actorService';

// Cap re-rolls so assembling a game can never hang indefinitely.
const MAX_GAME_BUILD_ATTEMPTS = 15;
// Reject bit-part start actors with thin filmographies (a real, connectable
// star has several credits) — keeps the starting actor recognizable.
const MIN_ACTOR_FILMS = 4;

const LEVEL: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

export async function createGame(
  difficulty: Difficulty = 'medium'
): Promise<Game> {
  let startingActor;
  let movie;
  let startingActorCredits: CreditModel[] = [];
  let actorAttempts = 0;
  do {
    if (actorAttempts++ >= MAX_GAME_BUILD_ATTEMPTS) {
      throw new Error('createGame: could not find a suitable starting actor');
    }
    movie = await fetchMovie(difficulty);
    startingActor = await fetchActorFromMovie(movie.id);
    if (startingActor === undefined || startingActor.adult === true) continue;
    startingActorCredits = await getCombinedCreditsOfAnActor(startingActor.id);
  } while (
    startingActor === undefined ||
    startingActor.adult === true ||
    startingActorCredits.length < MIN_ACTOR_FILMS
  );

  // Target must differ from the starting movie and not already be in the
  // starting actor's filmography, so the chain is non-trivial.
  let targetMovie = await fetchMovie(difficulty);
  let targetAttempts = 0;
  while (
    targetMovie.id === movie.id ||
    startingActorCredits.some(
      (credit: CreditModel) => credit.id === targetMovie.id
    )
  ) {
    if (targetAttempts++ >= MAX_GAME_BUILD_ATTEMPTS) {
      throw new Error('createGame: could not find a suitable target movie');
    }
    targetMovie = await fetchMovie(difficulty);
  }

  return {
    id: Date.now(),
    target: targetMovie,
    starting: {
      id: startingActor.id,
      name: startingActor.name,
      poster: startingActor.profile_path,
      role: '',
      combinedCredits: startingActorCredits,
    },
    level: LEVEL[difficulty],
  };
}

// Build a specific puzzle from a fixed start actor + target film (the daily).
// Deterministic: every player who runs the same ids gets the same game.
export async function createDailyGame(
  startActorId: number,
  targetMovieId: number
): Promise<Game> {
  const [starting, target] = await Promise.all([
    getActorDetails(startActorId),
    getMovieDetails(targetMovieId),
  ]);
  return { id: Date.now(), target, starting, level: LEVEL.medium };
}
