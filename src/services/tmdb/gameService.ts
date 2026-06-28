import { Game, CreditModel, Difficulty } from '../../../types';
import { fetchMovie } from './movieService';
import {
  fetchActorFromMovie,
  getCombinedCreditsOfAnActor,
} from './actorService';

// Cap re-rolls so assembling a game can never hang indefinitely.
const MAX_GAME_BUILD_ATTEMPTS = 15;

const LEVEL: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };

export async function createGame(
  difficulty: Difficulty = 'medium'
): Promise<Game> {
  let startingActor;
  let movie;
  let actorAttempts = 0;
  do {
    if (actorAttempts++ >= MAX_GAME_BUILD_ATTEMPTS) {
      throw new Error('createGame: could not find a suitable starting actor');
    }
    movie = await fetchMovie(difficulty);
    startingActor = await fetchActorFromMovie(movie.id);
  } while (startingActor === undefined || startingActor.adult === true);

  const startingActorCredits = await getCombinedCreditsOfAnActor(
    startingActor.id
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
