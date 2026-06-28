import { ActorModel, CreditModel } from '../../../types';
import { tmdbGet } from './client';
import {
  TmdbMovieCredits,
  TmdbCastMember,
  TmdbPersonMovieCredit,
  TmdbPersonMovieCredits,
  TmdbPersonDetails,
} from './types';

// Draw the starting actor from the most popular billed cast (TMDB popularity is
// small, so rank-and-take-top-N rather than threshold).
const TOP_CAST_POOL_SIZE = 10;

export async function fetchActorFromMovie(
  movieId: number
): Promise<TmdbCastMember | undefined> {
  const credits = await tmdbGet<TmdbMovieCredits>(`/movie/${movieId}/credits`);
  const topCast = [...(credits.cast ?? [])]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, TOP_CAST_POOL_SIZE);
  if (topCast.length === 0) return undefined;
  return topCast[Math.floor(Math.random() * topCast.length)];
}

// Build a person's connecting filmography from BOTH the films they directed and
// the films they acted in (so picking a director shows what they directed, not
// just their occasional acting roles). Directed films are considered first, so a
// film they both directed and acted in is labeled "Director"; dedupe is by film id.
function buildPersonCredits(credits: TmdbPersonMovieCredits): CreditModel[] {
  const directed = (credits.crew ?? []).filter((c) => c.job === 'Director');
  const acted = credits.cast ?? [];
  const unique = new Map<number, CreditModel>();

  const add = (credit: TmdbPersonMovieCredit, asDirector: boolean) => {
    const releaseDate = credit.release_date || credit.first_air_date;
    const character = credit.character ?? '';
    if (unique.has(credit.id) || !releaseDate) return;
    if (!asDirector && character.toLowerCase().includes('self')) return;
    unique.set(credit.id, {
      id: credit.id,
      title: credit.title || credit.name || '',
      originalTitle: credit.original_title || credit.original_name || '',
      poster: credit.poster_path,
      releaseDate,
      character: asDirector ? 'Director' : character,
    });
  };

  directed.forEach((c) => add(c, true));
  acted.forEach((c) => add(c, false));

  return Array.from(unique.values()).sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
}

export async function getCombinedCreditsOfAnActor(
  actorId: number
): Promise<CreditModel[]> {
  const json = await tmdbGet<TmdbPersonMovieCredits>(
    `/person/${actorId}/movie_credits`
  );
  return buildPersonCredits(json);
}

export async function getActorDetails(actorId: number): Promise<ActorModel> {
  const details = await tmdbGet<TmdbPersonDetails>(`/person/${actorId}`, {
    append_to_response: 'movie_credits',
  });
  return {
    id: details.id,
    name: details.name,
    poster: details.profile_path,
    role: '',
    combinedCredits: buildPersonCredits(details.movie_credits ?? { cast: [] }),
  };
}
