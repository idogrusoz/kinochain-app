import {
  MediaType,
  MovieSummaryModel,
  MovieDetailsModel,
  Difficulty,
} from '../../../types';
import { tmdbGet } from './client';
import {
  TmdbDiscoverResponse,
  TmdbMovieCredits,
  TmdbMovieDetails,
} from './types';

// Cap retries so a request fails fast instead of looping forever.
const MAX_FETCH_ATTEMPTS = 10;
// Exclude: TV movie, music, documentary, animation.
const WITHOUT_GENRES = '10770,10402,99,16';
// Keep the film's cast list manageable for the picker.
const MAX_CAST_IN_DETAILS = 20;

// Difficulty tunes how famous the films are via popularity + page depth, but a
// hard quality floor (votes + rating) keeps every movie recognizable — never a
// "what is this?" obscurity. Deeper pages = recognizable-but-less-front-of-mind.
const TARGET_MIN_VOTES = 4000;
const TARGET_MIN_RATING = 6.5;
const DIFFICULTY: Record<
  Difficulty,
  { minPopularity: number; pageRange: number }
> = {
  easy: { minPopularity: 30, pageRange: 3 },
  medium: { minPopularity: 10, pageRange: 10 },
  hard: { minPopularity: 5, pageRange: 20 },
};

export async function fetchMovie(
  difficulty: Difficulty = 'medium'
): Promise<MovieSummaryModel> {
  const cfg = DIFFICULTY[difficulty];
  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt++) {
    const page = Math.floor(Math.random() * cfg.pageRange) + 1;
    const json = await tmdbGet<TmdbDiscoverResponse>('/discover/movie', {
      include_adult: false,
      include_video: false,
      page,
      'release_date.gte': '1980-01-01',
      sort_by: 'popularity.desc',
      'vote_count.gte': TARGET_MIN_VOTES,
      'vote_average.gte': TARGET_MIN_RATING,
      with_original_language: 'en',
      without_genres: WITHOUT_GENRES,
    });
    const movies = (json.results ?? []).filter(
      (m) => m.popularity > cfg.minPopularity
    );
    if (movies.length === 0) continue;
    const m = movies[Math.floor(Math.random() * movies.length)];
    return {
      id: m.id,
      title: m.title,
      originalTitle: m.original_title,
      poster: m.poster_path,
      releaseDate: m.release_date ?? '',
      mediaType: MediaType.Movie,
    };
  }
  throw new Error(
    `fetchMovie: no movie passed the filter after ${MAX_FETCH_ATTEMPTS} attempts`
  );
}

export async function getMovieDetails(
  movieId: number
): Promise<MovieDetailsModel> {
  const [details, credits] = await Promise.all([
    tmdbGet<TmdbMovieDetails>(`/movie/${movieId}`),
    tmdbGet<TmdbMovieCredits>(`/movie/${movieId}/credits`),
  ]);

  // De-dupe by person id so the combined cast+crew list never repeats a person
  // (TMDB can list the same actor twice for dual roles, and a director may also
  // appear in the cast). Directors are collected FIRST so they take precedence
  // (an actor-director shows as the director) and can be surfaced at the top.
  const seen = new Set<number>();

  const crew: MovieDetailsModel['crew'] = [];
  for (const c of credits.crew ?? []) {
    if (c.job !== 'Director' || seen.has(c.id)) continue;
    seen.add(c.id);
    crew.push({ id: c.id, name: c.name, poster: c.profile_path, job: c.job });
  }

  const cast: MovieDetailsModel['cast'] = [];
  for (const c of credits.cast ?? []) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    cast.push({
      id: c.id,
      name: c.name,
      poster: c.profile_path,
      character: c.character,
    });
    if (cast.length >= MAX_CAST_IN_DETAILS) break;
  }

  return {
    id: details.id,
    title: details.title,
    originalTitle: details.original_title,
    poster: details.poster_path,
    releaseDate: details.release_date ?? '',
    mediaType: MediaType.Movie,
    overview: details.overview ?? '',
    genres: (details.genres ?? []).map((g) => g.name),
    cast,
    crew,
  };
}
