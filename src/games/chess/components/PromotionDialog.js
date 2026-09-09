"use client";

import { GLYPH, WHITE } from "../constants";

/** Inline promotion picker shown when a pawn reaches the last rank. */
export default function PromotionDialog({ color, onSelect }) {
  const pieces = ["q", "r", "b", "n"];
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-soft">
      <span className="px-1 text-sm text-muted">Promote to:</span>
      {pieces.map((p) => {
        const key = color === WHITE ? p.toUpperCase() : p;
        return (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-2xl text-fg transition hover:bg-accent-soft focus-ring"
            aria-label={`Promote to ${p}`}
          >
            {GLYPH[key]}
          </button>
        );
      })}
    </div>
  );
}

