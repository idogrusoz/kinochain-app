import AsyncStorage from '@react-native-async-storage/async-storage';

// On-device player stats + daily play streak. Local-only (no account, no
// network) — the foundation the win screen, share card, and future badges
// read from. A "streak" here is consecutive calendar days with at least one
// completed game; when the daily challenge ships it becomes the daily streak.
const KEY = 'kinochain.stats';

export type Stats = {
  gamesCompleted: number;
  bestMoves: number | null;
  noHintWins: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDay: string | null; // local YYYY-MM-DD
};

const EMPTY: Stats = {
  gamesCompleted: 0,
  bestMoves: null,
  noHintWins: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDay: null,
};

// Local calendar day key (not UTC) so the streak matches the player's day.
function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Whole calendar days from a → b (both YYYY-MM-DD), parsed at local midnight.
function dayDiff(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime();
  const db = new Date(`${b}T00:00:00`).getTime();
  return Math.round((db - da) / 86_400_000);
}

// The stored currentStreak only updates on a win, so it can be stale when
// viewed later. A streak is still "alive" only if the last game was today or
// yesterday; otherwise the effective current streak is 0.
export function currentStreakAsOf(stats: Stats, now: Date = new Date()): number {
  if (!stats.lastPlayedDay) return 0;
  return dayDiff(stats.lastPlayedDay, dayKey(now)) <= 1 ? stats.currentStreak : 0;
}

export async function loadStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

// Record a completed game and return the updated stats. Idempotent across a
// single day for the streak (playing again the same day doesn't bump it).
export async function recordWin(opts: {
  moves: number;
  hintUsed: boolean;
}): Promise<Stats> {
  const prev = await loadStats();
  const today = dayKey();

  let currentStreak: number;
  if (prev.lastPlayedDay === today) {
    currentStreak = Math.max(prev.currentStreak, 1); // already counted today
  } else if (prev.lastPlayedDay && dayDiff(prev.lastPlayedDay, today) === 1) {
    currentStreak = prev.currentStreak + 1; // consecutive day
  } else {
    currentStreak = 1; // first game ever, or a missed day → reset
  }

  const next: Stats = {
    gamesCompleted: prev.gamesCompleted + 1,
    bestMoves: prev.bestMoves == null ? opts.moves : Math.min(prev.bestMoves, opts.moves),
    noHintWins: prev.noHintWins + (opts.hintUsed ? 0 : 1),
    currentStreak,
    longestStreak: Math.max(prev.longestStreak, currentStreak),
    lastPlayedDay: today,
  };

  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // best-effort; a failed write just means this game isn't counted
  }
  return next;
}
