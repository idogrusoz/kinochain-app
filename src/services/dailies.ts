import AsyncStorage from '@react-native-async-storage/async-storage';
import pack from '../data/dailies.json';

// The Daily Challenge: one numbered puzzle per day, the SAME for everyone.
// Puzzle definitions are bundled (src/data/dailies.json, generated offline by
// scripts/generate-dailies.js) — no server, no per-day update. The running day
// number increments daily; content cycles through the bundled pack when the day
// number exceeds the pack size (so it never "runs out" before a content update).
const EPOCH = new Date('2026-07-01T00:00:00'); // day #1
const KEY = 'kinochain.daily';

export type DailyPuzzle = {
  dayNumber: number; // running counter shown as "Kinochain #N"
  startActorId: number;
  targetMovieId: number;
  startActorName: string;
  targetTitle: string;
};

export type DailyResult = { moves: number; seconds: number; hintUsed: boolean };

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: Date, b: Date): number {
  const ma = new Date(`${dayKey(a)}T00:00:00`).getTime();
  const mb = new Date(`${dayKey(b)}T00:00:00`).getTime();
  return Math.round((mb - ma) / 86_400_000);
}

export function getTodayDaily(now: Date = new Date()): DailyPuzzle {
  const dayNumber = Math.max(1, daysBetween(EPOCH, now) + 1);
  const item = pack[(dayNumber - 1) % pack.length];
  return {
    dayNumber,
    startActorId: item.startActorId,
    targetMovieId: item.targetMovieId,
    startActorName: item.startActorName,
    targetTitle: item.targetTitle,
  };
}

type Stored = DailyResult & { lastCompletedDayNumber: number };

// Today's stored result, or null if today's daily hasn't been completed.
export async function getDailyCompletion(dayNumber: number): Promise<DailyResult | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    return s.lastCompletedDayNumber === dayNumber
      ? { moves: s.moves, seconds: s.seconds, hintUsed: s.hintUsed }
      : null;
  } catch {
    return null;
  }
}

export async function markDailyCompleted(dayNumber: number, r: DailyResult): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ lastCompletedDayNumber: dayNumber, ...r } satisfies Stored)
    );
  } catch {
    // best-effort
  }
}
