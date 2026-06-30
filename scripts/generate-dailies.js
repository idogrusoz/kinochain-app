/*
 * Kinochain daily-puzzle generator (run locally, NOT on device, NOT per day).
 *
 *   node scripts/generate-dailies.js [count]   # default 14
 *
 * Builds each puzzle CONSTRUCT-FORWARD: pick a popular start movie → a top-billed
 * actor in it (the START ACTOR) → walk 3 film-hops through co-stars → the final
 * film is the TARGET. Because the chain is built by walking it, a solution is
 * GUARANTEED to exist — no graph search / BFS, no "par". We then validate the
 * target isn't already in the start actor's filmography (so it's non-trivial).
 *
 * Output: src/data/dailies.json = [{ number, startActorId, startActorName,
 * targetMovieId, targetTitle }]. The app indexes this by date so everyone gets
 * the same numbered puzzle. Names are included only for human readability.
 *
 * Hits TMDB a handful of times per puzzle, once per batch, from your machine —
 * well within fair use. Reads the v3 key from .env (never logged).
 */

const fs = require('fs');
const path = require('path');

// ── config ────────────────────────────────────────────────────────────
const COUNT = parseInt(process.argv[2], 10) || 14;
const DEPTH = 3; // film-hops from start actor to target
const TOP_CAST_POOL = 10; // pick the start/co actor from the N most popular
const ACTOR_FILM_MIN_VOTES = 300; // keep connecting films recognizable
const TARGET_MIN_VOTES = 4000; // the target should be widely recognized
const TARGET_MIN_RATING = 6.5; // ...and well-regarded — filters out cheap films
const EXCLUDE_GENRES = new Set([99, 16, 10770]); // documentary, animation, TV movie
const MIN_YEAR = 1980;
const MAX_PUZZLE_ATTEMPTS = 40;
const OUT = path.join(__dirname, '..', 'src', 'data', 'dailies.json');

// ── TMDB ──────────────────────────────────────────────────────────────
function readApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  const txt = fs.readFileSync(envPath, 'utf8');
  const line = txt.split('\n').find((l) => l.startsWith('EXPO_PUBLIC_TMDB_API_KEY='));
  if (!line) throw new Error('EXPO_PUBLIC_TMDB_API_KEY not found in .env');
  return line.slice('EXPO_PUBLIC_TMDB_API_KEY='.length).trim();
}
const API_KEY = readApiKey();
const BASE = 'https://api.themoviedb.org/3';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tmdb(p, params = {}) {
  const qs = new URLSearchParams({ api_key: API_KEY, language: 'en-US', ...params });
  const res = await fetch(`${BASE}${p}?${qs}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${p}`);
  await sleep(40); // be polite
  return res.json();
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const year = (d) => (d ? parseInt(d.slice(0, 4), 10) : 0);

// A target the audience will recognize: mainstream awareness + well-regarded.
const meetsTargetBar = (f) =>
  (f.vote_count || 0) >= TARGET_MIN_VOTES && (f.vote_average || 0) >= TARGET_MIN_RATING;

async function randomPopularMovie() {
  const page = Math.floor(Math.random() * 10) + 1;
  const json = await tmdb('/discover/movie', {
    include_adult: 'false',
    include_video: 'false',
    page,
    sort_by: 'popularity.desc',
    'vote_count.gte': 200,
    'release_date.gte': `${MIN_YEAR}-01-01`,
    with_original_language: 'en',
    without_genres: '10770,10402,99,16',
  });
  const movies = (json.results || []).filter((m) => m.popularity > 10);
  return movies.length ? pick(movies) : null;
}

async function topCastActor(movieId, exclude) {
  const json = await tmdb(`/movie/${movieId}/credits`);
  const pool = (json.cast || [])
    .filter((c) => !c.adult && !exclude.has(c.id))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, TOP_CAST_POOL);
  return pool.length ? pick(pool) : null;
}

async function actorFilms(actorId) {
  const json = await tmdb(`/person/${actorId}/movie_credits`);
  return (json.cast || []).filter(
    (c) =>
      c.poster_path &&
      year(c.release_date) >= MIN_YEAR &&
      (c.vote_count || 0) >= ACTOR_FILM_MIN_VOTES &&
      !(c.genre_ids || []).some((g) => EXCLUDE_GENRES.has(g))
  );
}

// ── construct-forward puzzle ──────────────────────────────────────────
async function buildPuzzle(usedStartActors, usedTargets) {
  for (let attempt = 0; attempt < MAX_PUZZLE_ATTEMPTS; attempt++) {
    const startMovie = await randomPopularMovie();
    if (!startMovie) continue;
    const startActor = await topCastActor(startMovie.id, new Set());
    if (!startActor || usedStartActors.has(startActor.id)) continue;

    const startFilms = await actorFilms(startActor.id);
    // Reject bit-part players whose TMDB popularity is inflated: a real,
    // connectable start actor has several well-known films.
    if (startFilms.length < 4) continue;
    const startFilmIds = new Set(startFilms.map((f) => f.id));

    const usedMovies = new Set([startMovie.id]);
    const usedActors = new Set([startActor.id]);
    let currentActorId = startActor.id;
    let lastFilm = null;
    let broke = false;

    for (let hop = 1; hop <= DEPTH; hop++) {
      const films = hop === 1 ? startFilms : await actorFilms(currentActorId);
      const choices = films.filter((f) => !usedMovies.has(f.id));
      if (!choices.length) { broke = true; break; }
      // The final hop is the TARGET — it must clear the recognizability bar;
      // bias toward the most-voted among those. Intermediate hops (hidden in
      // the solution path) can be any eligible film.
      let film;
      if (hop === DEPTH) {
        const candidates = choices
          .filter(meetsTargetBar)
          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
          .slice(0, 8);
        if (!candidates.length) { broke = true; break; }
        film = pick(candidates);
      } else {
        film = pick(choices);
      }
      usedMovies.add(film.id);
      lastFilm = film;

      if (hop < DEPTH) {
        const co = await topCastActor(film.id, usedActors);
        if (!co) { broke = true; break; }
        usedActors.add(co.id);
        currentActorId = co.id;
      }
    }
    if (broke || !lastFilm) continue;

    // Validations: non-trivial (target not already in start actor's films),
    // well-known, and not a repeat target across the batch.
    if (startFilmIds.has(lastFilm.id)) continue;
    if (!meetsTargetBar(lastFilm)) continue;
    if (usedTargets.has(lastFilm.id)) continue;

    return {
      startActorId: startActor.id,
      startActorName: startActor.name,
      targetMovieId: lastFilm.id,
      targetTitle: lastFilm.title,
    };
  }
  return null;
}

async function generateBatch() {
  const puzzles = [];
  const usedStartActors = new Set();
  const usedTargets = new Set();

  for (let n = 1; n <= COUNT; n++) {
    const p = await buildPuzzle(usedStartActors, usedTargets);
    if (!p) {
      console.warn(`! puzzle ${n}: gave up after ${MAX_PUZZLE_ATTEMPTS} attempts`);
      continue;
    }
    usedStartActors.add(p.startActorId);
    usedTargets.add(p.targetMovieId);
    puzzles.push({ number: puzzles.length + 1, ...p });
    console.log(`#${puzzles.length}  ${p.startActorName}  →  ${p.targetTitle}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(puzzles, null, 2) + '\n');
  console.log(`\nWrote ${puzzles.length} puzzles → ${path.relative(process.cwd(), OUT)}`);
}

// Regenerate only specific puzzle numbers, preserving the rest:
//   node scripts/generate-dailies.js --replace 6,7,10,14
async function replaceMode(csv) {
  const nums = new Set(
    (csv || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean)
  );
  if (!nums.size) throw new Error('--replace needs numbers, e.g. 6,7,10,14');

  const existing = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const kept = existing.filter((p) => !nums.has(p.number));
  const usedStartActors = new Set(kept.map((p) => p.startActorId));
  const usedTargets = new Set(kept.map((p) => p.targetMovieId));
  const result = [...existing];

  for (const num of [...nums].sort((a, b) => a - b)) {
    const np = await buildPuzzle(usedStartActors, usedTargets);
    if (!np) { console.warn(`! could not regenerate #${num}`); continue; }
    usedStartActors.add(np.startActorId);
    usedTargets.add(np.targetMovieId);
    const idx = result.findIndex((p) => p.number === num);
    result[idx] = { number: num, ...np };
    console.log(`#${num}  ${np.startActorName}  →  ${np.targetTitle}  (replaced)`);
  }

  fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
  console.log(`\nReplaced ${nums.size} puzzle(s) → ${path.relative(process.cwd(), OUT)}`);
}

async function main() {
  const i = process.argv.indexOf('--replace');
  if (i !== -1) return replaceMode(process.argv[i + 1]);
  return generateBatch();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
