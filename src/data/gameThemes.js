import { Crown, CircleDot, Grid3x3, Anchor } from "lucide-react";

/**
 * Per-game visual identity. Each game gets its own atmosphere — an accent glow,
 * a decorative backdrop pattern, a big relevant icon and a short tagline — so
 * every board feels like its own little environment while sharing one design
 * language. `rgb` is a space-separated triplet so it can be dropped into
 * `rgb(<triplet> / <alpha>)` for translucent layers.
 */
export const GAME_THEMES = {
  chess: {
    Icon: Crown,
    tagline: "Grandmaster's table",
    rgb: "98 50 170", // primary #6232AA
    pattern: "checker",
  },
  "connect-4": {
    Icon: CircleDot,
    tagline: "Arcade drop zone",
    rgb: "124 77 196", // primary, lifted
    pattern: "dots",
  },
  "tic-tac-toe": {
    Icon: Grid3x3,
    tagline: "Quick-play grid",
    rgb: "143 99 214", // primary, light
    pattern: "grid",
  },
  battleship: {
    Icon: Anchor,
    tagline: "Open waters",
    rgb: "74 34 134", // primary, deep
    pattern: "waves",
  },
};

const FALLBACK = {
  Icon: Crown,
  tagline: "Let's play",
  rgb: "98 50 170",
  pattern: "dots",
};

export const getGameTheme = (slug) => GAME_THEMES[slug] || FALLBACK;

/**
 * Build the CSS background for a game's decorative pattern layer.
 * Returned styles are meant for a low-opacity absolutely-positioned overlay.
 * @param {string} pattern
 * @param {string} rgb  space-separated triplet
 */
export function patternStyle(pattern, rgb) {
  switch (pattern) {
    case "checker":
      return {
        backgroundImage: `conic-gradient(rgb(${rgb} / 0.6) 90deg, transparent 90deg 180deg, rgb(${rgb} / 0.6) 180deg 270deg, transparent 270deg)`,
        backgroundSize: "44px 44px",
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(rgb(${rgb} / 0.7) 2px, transparent 2.4px)`,
        backgroundSize: "26px 26px",
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(rgb(${rgb} / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(${rgb} / 0.6) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      };
    case "waves":
      return {
        backgroundImage: `radial-gradient(circle at 50% 120%, rgb(${rgb} / 0.55) 0 6px, transparent 7px 20px)`,
        backgroundSize: "40px 20px",
      };
    default:
      return {};
  }
}

