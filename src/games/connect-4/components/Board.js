"use client";

import { availableColumns } from "../engine";
import { COLS, RED } from "../constants";
import { cn } from "@/utils/cn";
import { CELL_PX, responsiveCell } from "@/lib/boardSize";

/** Connect 4 grid in a cognac frame. Click a column to drop a disc. */
export default function Board({ state, onDrop, canPlay, size = "md" }) {
  const { board, winningCells } = state;
  const openCols = availableColumns(board);
  const cell = responsiveCell(CELL_PX["connect-4"][size] ?? CELL_PX["connect-4"].md, COLS);

  return (
    <div
      className="inline-block rounded-2xl p-3 shadow-lift"
      style={{
        background: "linear-gradient(145deg, rgb(var(--accent-strong)), rgb(var(--accent)))",
        "--cell": cell,
      }}
    >
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {board.map((cell, i) => {
          const col = i % COLS;
          const isWin = winningCells?.includes(i);
          const playable = canPlay(col) && openCols.includes(col);
          return (
            <button
              key={i}
              onClick={() => playable && onDrop(col)}
              disabled={!playable}
              aria-label={`Column ${col + 1}`}
              className={cn(
                "flex aspect-square w-[var(--cell)] items-center justify-center rounded-full bg-bg/85 transition",
                playable && "hover:ring-2 hover:ring-white/50",
                isWin && "ring-2 ring-white"
              )}
            >
              <span
                className={cn(
                  "h-[78%] w-[78%] rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.35)]",
                  cell === RED && "bg-[#e0505f]",
                  cell === "Y" && "bg-[#eab02f]",
                  !cell && "bg-transparent shadow-[inset_0_3px_6px_rgba(0,0,0,0.28)]"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

