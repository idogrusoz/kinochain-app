// Base entity type
export interface BaseEntity {
  id: number;
}

// Media type enum
export enum MediaType {
  Movie = 'movie',
  TV = 'tv'
}

// Actor types
export interface ActorModel extends BaseEntity {
  name: string;
  poster: string | null;
  role: string;
  combinedCredits: CreditModel[];
}

export interface CreditModel extends BaseEntity {
  title: string;
  originalTitle: string;
  releaseDate: string;
  poster: string | null;
  character: string;
}

// Movie types
export interface MovieSummaryModel extends BaseEntity {
  title: string;
  originalTitle: string;
  poster: string | null;
  releaseDate: string;
  mediaType: MediaType;
}

export interface MovieDetailsModel extends MovieSummaryModel {
  overview: string;
  genres: string[];
  cast: MovieCastModel[];
  crew: MovieCrewModel[];
}

export interface MovieCreditBaseModel extends BaseEntity {
  name: string;
  poster: string | null;
}

export interface MovieCastModel extends MovieCreditBaseModel {
  character: string;
}

export interface MovieCrewModel extends MovieCreditBaseModel {
  job: string;
}

// Game state types
export interface GameState {
  targetMovie: MovieDetailsModel;
  currentActor: ActorModel;
  guessedActors: ActorModel[];
  remainingGuesses: number;
  score: number;
}

// Game interface
export interface Game extends BaseEntity {
  target: MovieSummaryModel;
  starting: ActorModel;
  level: number;
};


// API response type (if needed)
export interface TMDbResponse {
  results: MovieDetailsModel;
}

export interface Credit {
  titleId: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  releaseDate?: string;
}