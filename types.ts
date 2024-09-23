// Basic person type
export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
}

// Cast member type
export interface CastMember extends Person {
  character: string;
  order: number;
}

// Crew member type
export interface CrewMember extends Person {
  department: string;
  job: string;
}

// Movie credits type
export interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// Movie type (if needed)
export interface Movie {
  id: number;
  title: string;
  // Add other movie properties as needed
}

// Game state types (example)
export interface GameState {
  currentMovie: Movie;
  guessedActors: CastMember[];
  remainingGuesses: number;
  score: number;
}

// API response type
export interface TMDbResponse {
  results: MovieCredits;
}

// Actor type (more detailed than the previous Person type)
export interface Actor {
  adult: boolean;
  cast_id: number;
  character: string;
  credit_id: string;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  order: number;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  combinedCredits?: any[]; // You might want to define a more specific type for this
}

// Game interface
export interface Game {
  gameId: string;
  level: number;
  startingActor: Actor;
  targetActor: Actor;
}
