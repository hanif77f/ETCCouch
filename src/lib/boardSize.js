"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Shared board-sizing system.
 *
 * A single S/M/L preference (persisted in localStorage) drives the cell size of
 * every game board. Boards translate the preset into a responsive `--cell` CSS
 * variable so the same preference scales sensibly on phones and desktops.
 */

export const SIZE_STEPS = ["sm", "md", "lg"];

export const SIZE_META = {
  sm: { label: "S", title: "Small" },
  md: { label: "M", title: "Medium" },
  lg: { label: "L", title: "Large" },
};

// Per-game cell edge (px) for the "md" desktop baseline, per preset.
export const CELL_PX = {
  chess: { sm: 40, md: 54, lg: 68 },
  "connect-4": { sm: 36, md: 46, lg: 58 },
  battleship: { sm: 20, md: 26, lg: 32 },
};

// Games sized by overall board width rather than a single cell.
export const BOARD_PX = {
  "tic-tac-toe": { sm: 250, md: 330, lg: 410 },
};

/**
 * Build a responsive length that never overflows small screens: it uses the
 * requested px on roomy viewports but shrinks to a share of the viewport width
 * once space runs out.
 * @param {number} px      desired size in px
 * @param {number} cols    number of columns spanning the viewport share
 * @param {number} [vw]    viewport-width budget (default 92)
 */
export const responsiveCell = (px, cols, vw = 92) =>
  `min(${px}px, calc(${vw}vw / ${cols}))`;

/** Overall-width variant (for boards sized as a whole, e.g. tic-tac-toe). */
export const responsiveWidth = (px, vw = 90) => `min(${px}px, ${vw}vw)`;

const STORAGE_KEY = "boardSize";

/** React hook: current board size preset + a persisted setter. */
export function useBoardSize(defaultSize = "md") {
  const [size, setSizeState] = useState(defaultSize);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SIZE_STEPS.includes(stored)) setSizeState(stored);
      } catch {
      /* localStorage unavailable — keep default */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const setSize = useCallback((next) => {
    if (!SIZE_STEPS.includes(next)) return;
    setSizeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore write failures */
    }
  }, []);

  return [size, setSize];
}
