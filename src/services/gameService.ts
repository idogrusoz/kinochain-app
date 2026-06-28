import { ActorModel, Game, MovieDetailsModel, Difficulty } from '../../types';
import { createGame } from './tmdb/gameService';
import { getMovieDetails } from './tmdb/movieService';
import { getActorDetails } from './tmdb/actorService';

// Public game API used by the screens. All logic runs on-device against TMDB
// directly (no backend); see ./tmdb/* for the implementation.

export const startNewGame = async (
  difficulty: Difficulty = 'medium'
): Promise<Game> => createGame(difficulty);

export const fetchMovieDetails = async (
  movieId: number
): Promise<MovieDetailsModel> => getMovieDetails(movieId);

export const fetchActorDetails = async (
  actorId: number
): Promise<ActorModel> => getActorDetails(actorId);
