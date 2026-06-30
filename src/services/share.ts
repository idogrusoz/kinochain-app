import i18n from '../i18n/i18n';

// Install destination appended to the share. Empty until a real App Store /
// landing URL exists — set this one constant to switch the link on everywhere.
const SHARE_URL = '';

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// The spoiler-free "Chain Card", built identically for the win screen and for
// re-sharing a completed daily later. The chain is always a strict
// actor→film→…→target alternation, so the emoji grid is fully determined by the
// move count — no need to store the solution path.
//   ⭐ actor · 🎬 film · 🏁 target reached
// Daily shares carry the puzzle number (#142) so they're comparable; free games
// omit it.
export function buildChainCard(opts: {
  dayNumber?: number;
  startName: string;
  targetTitle: string;
  moves: number;
  seconds: number;
  hintUsed: boolean;
  streak?: number | null;
}): string {
  const { dayNumber, startName, targetTitle, moves, seconds, hintUsed, streak } = opts;

  const nodes = moves + 1; // chain includes the start actor and the target film
  let grid = '';
  for (let i = 0; i < nodes; i++) {
    grid += i === nodes - 1 ? '🏁' : i % 2 === 0 ? '⭐' : '🎬';
  }

  const header = dayNumber != null ? `KINOCHAIN #${dayNumber} 🎬` : 'KINOCHAIN 🎬';
  const solved =
    i18n.t('winning.shareSolved', { moves: String(moves), time: formatTime(seconds) }) +
    (hintUsed ? '' : ` · 🧠 ${i18n.t('winning.shareNoHint')}`);

  const lines = [
    header,
    i18n.t('winning.shareLinked', { from: startName, to: targetTitle }),
    '',
    grid,
    solved,
  ];
  if (streak && streak >= 2) lines.push(`🔥 ${i18n.t('winning.streak', { n: String(streak) })}`);
  // Only the daily is the same puzzle for everyone, so only it can honestly say
  // "beat my chain". A random game can't be replayed by a friend yet (that needs
  // the future challenge-by-link), so it gets a neutral brand footer instead.
  lines.push('', dayNumber != null ? i18n.t('winning.shareCta') : i18n.t('splash.tagline'));
  if (SHARE_URL) lines.push(SHARE_URL);
  return lines.join('\n');
}
