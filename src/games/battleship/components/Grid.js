"use client";

import { SIZE } from "../constants";
import { cn } from "@/utils/cn";
import { CELL_PX, responsiveCell } from "@/lib/boardSize";

/**
 * One 10x10 grid.
 * - "enemy" hides ships, shows hits/misses, cells are clickable to fire.
 * - "own" reveals your ships and incoming shots.
 */
export default function Grid({ variant, fleet, shots, sunk, onFire, disabled, size = "md" }) {
  const shipCells = new Set(fleet.flatMap((s) => s.cells));
  const sunkSet = new Set(sunk);
  // Two grids sit side by side, so budget half the viewport width on mobile.
  const cell = responsiveCell(CELL_PX.battleship[size] ?? CELL_PX.battleship.md, SIZE, 46);

  const cellState = (i) => {
    const isShip = shipCells.has(i);
    const isShot = shots.has(i);
    if (isShot && isShip) return sunkSet.has(i) ? "sunk" : "hit";
    if (isShot) return "miss";
    if (variant === "own" && isShip) return "ship";
    return "water";
  };

  return (
    <div
      className="grid gap-0.5 rounded-xl border border-border bg-surface p-1.5 shadow-soft"
      style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`, "--cell": cell }}
    >
      {Array.from({ length: SIZE * SIZE }, (_, i) => {
        const st = cellState(i);
        const clickable = variant === "enemy" && !disabled && !shots.has(i);
        return (
          <button
            key={i}
            onClick={() => clickable && onFire?.(i)}
            disabled={!clickable}
            aria-label={`Cell ${i}`}
            className={cn(
              "aspect-square w-[var(--cell)] rounded-[3px] transition",
              st === "water" && "bg-card",
              st === "ship" && "bg-muted/60",
              st === "miss" && "bg-border",
              st === "hit" && "bg-accent",
              st === "sunk" && "bg-[#d1495b]",
              clickable && "cursor-pointer hover:bg-accent/40"
            )}
          >
            {st === "miss" ? <span className="mx-auto block h-1 w-1 rounded-full bg-muted" /> : null}
          </button>
        );
      })}
    </div>
  );
}

