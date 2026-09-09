"use client";

import { getGameTheme, patternStyle } from "@/data/gameThemes";

/**
 * GameEnvironment — a themed "stage" the board sits on. Renders, from back to
 * front: a soft accent glow, a faint game-specific pattern, and a big watermark
 * icon in the corner. The board (children) floats on top. Purely decorative and
 * pointer-transparent so it never interferes with play.
 */
export default function GameEnvironment({ slug, children }) {
  const theme = getGameTheme(slug);
  const { Icon, rgb, pattern } = theme;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border p-5 shadow-card sm:p-8"
      style={{
        background: `radial-gradient(130% 120% at 50% -20%, rgb(${rgb} / 0.16), transparent 62%), linear-gradient(160deg, rgb(var(--surface)), rgb(var(--card)))`,
      }}
    >
      {/* Faint themed pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={patternStyle(pattern, rgb)}
      />

      {/* Big watermark icon */}
      <Icon
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-6"
        style={{ color: `rgb(${rgb})`, opacity: 0.08 }}
        strokeWidth={1.25}
      />

      {/* Accent corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: `rgb(${rgb} / 0.14)` }}
      />

      {/* Board */}
      <div className="relative z-10 flex w-full flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
}

