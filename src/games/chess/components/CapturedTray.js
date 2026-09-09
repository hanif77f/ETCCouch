"use client";

import { WHITE, BLACK } from "../constants";

// Filled glyphs (same style as the board), colored via CSS.
const FILLED = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
const START_COUNT = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 };
// Show heavier pieces first so a captured queen reads immediately.
const ORDER = ["q", "r", "b", "n", "p"];

/**
 * Derive captured pieces by diffing the live board against the starting set.
 * Returns, for each capturing side, the list of enemy pieces it has taken plus
 * the running material score.
 */
export function computeCaptured(board) {
  const alive = { w: {}, b: {} };
  for (const piece of board) {
    if (!piece) continue;
    const color = piece === piece.toUpperCase() ? "w" : "b";
    const type = piece.toLowerCase();
    alive[color][type] = (alive[color][type] || 0) + 1;
  }

  const missing = (color) =>
    ORDER.flatMap((type) => {
      const gone = START_COUNT[type] - (alive[color][type] || 0);
      return gone > 0 ? Array(gone).fill(type) : [];
    });

  const blackTaken = missing("b"); // black pieces removed -> captured BY white
  const whiteTaken = missing("w"); // white pieces removed -> captured BY black
  const score = (list) => list.reduce((s, t) => s + VALUE[t], 0);

  return {
    // pieces each side has captured, and the net advantage (+ favours that side)
    whiteCaptured: blackTaken,
    blackCaptured: whiteTaken,
    advantage: score(blackTaken) - score(whiteTaken),
  };
}

/**
 * Tray of captured pieces for one side, e.g. every enemy piece that has been
 * taken. `owner` is the color doing the capturing; the glyphs are the
 * opponent's pieces. `compact` switches to a narrow vertical layout meant to
 * sit beside the board (not stacked above/below it).
 */
export default function CapturedTray({ pieces, owner, advantage, compact = false }) {
  const isWhite = owner === WHITE;
  const glyphColor = isWhite ? "#241d16" : "#f7f3ec"; // captured pieces are the OPPONENT's color
  const stroke = isWhite ? "0.6px rgba(247,243,236,0.35)" : "0.9px rgba(28,20,12,0.55)";

  const glyphs =
    pieces.length === 0 ? (
      <span className={compact ? "text-xs text-brandbar-fg/40" : "text-xs text-muted/60"}>—</span>
    ) : (
      pieces.map((type, i) => (
        <span
          key={`${type}-${i}`}
          className={compact ? "select-none text-[15px] leading-none" : "select-none text-[20px] leading-none sm:text-[22px]"}
          style={{ color: glyphColor, WebkitTextStroke: stroke }}
          aria-label={`captured ${type}`}
        >
          {FILLED[type]}
        </span>
      ))
    );

  if (compact) {
    return (
      <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-20">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-brandbar-fg/60">
          {isWhite ? "White" : "Black"}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-0.5">{glyphs}</div>
        {advantage > 0 ? (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
            +{advantage}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-[30px] w-full max-w-[min(92vw,560px)] items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">
        {isWhite ? "White" : "Black"}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-0.5">{glyphs}</div>
      {advantage > 0 ? (
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
          +{advantage}
        </span>
      ) : null}
    </div>
  );
}

export { BLACK };

