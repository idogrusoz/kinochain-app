import { ActorModel, Game, MovieDetailsModel, Difficulty } from '../../types';
import { createGame } from './tmdb/gameService';
import { getMovieDetails } from './tmdb/movieService';
import { getActorDetails } from './tmdb/actorService';

// Public game API used by the screens. Game construction stays on-device; the
// TMDB services call the narrow Cloudflare proxy configured in tmdb/client.ts.

export const startNewGame = async (
  difficulty: Difficulty = 'medium'
): Promise<Game> => createGame(difficulty);

export const fetchMovieDetails = async (
  movieId: number
): Promise<MovieDetailsModel> => getMovieDetails(movieId);

export const fetchActorDetails = async (
  actorId: number
): Promise<ActorModel> => getActorDetails(actorId);
