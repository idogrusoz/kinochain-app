// Raw TMDB response shapes (snake_case), narrowed to the fields we use.
// These are mapped into the app's camelCase models (see ../../types.ts).

export interface TmdbDiscoverResult {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  release_date: string;
  popularity: number;
  genre_ids: number[];
}

export interface TmdbDiscoverResponse {
  results: TmdbDiscoverResult[];
}

export interface TmdbCastMember {
  id: number;
  name: string;
  profile_path: string | null;
  character: string;
  popularity: number;
  adult?: boolean;
  order?: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  profile_path: string | null;
  job: string;
  department: string;
  popularity: number;
}

export interface TmdbMovieCredits {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbPersonMovieCredit {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  character?: string;
  job?: string;
  popularity: number;
  vote_average?: number;
}

export interface TmdbPersonMovieCredits {
  cast: TmdbPersonMovieCredit[];
  crew?: TmdbPersonMovieCredit[];
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  genres: { id: number; name: string }[];
}

export interface TmdbPersonDetails {
  id: number;
  name: string;
  profile_path: string | null;
  movie_credits: TmdbPersonMovieCredits;
}
