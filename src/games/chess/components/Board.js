"use client";

import Square from "./Square";
import { CELL_PX, responsiveCell } from "@/lib/boardSize";

/** 8x8 board from white's perspective inside a premium wooden frame. */
export default function Board({ board, selected, legalTargets, lastMove, onSquareClick, size = "md" }) {
  const targets = new Set(legalTargets);
  const last = lastMove ? new Set([lastMove.from, lastMove.to]) : new Set();
  const cell = responsiveCell(CELL_PX.chess[size] ?? CELL_PX.chess.md, 8);

  return (
    <div
      className="wood-frame rounded-xl p-3 sm:p-4"
      style={{
        // Drives every square's size; boards recompute this from the S/M/L preset.
        "--cell": cell,
      }}
    >
      <div className="grid grid-cols-8 overflow-hidden rounded-[3px] ring-1 ring-black/40 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.25)]">
        {board.map((piece, i) => {
          const r = i >> 3;
          const c = i & 7;
          return (
            <Square
              key={i}
              index={i}
              piece={piece}
              light={(r + c) % 2 === 0}
              selected={selected === i}
              isTarget={targets.has(i)}
              isLastMove={last.has(i)}
              onClick={onSquareClick}
            />
          );
        })}
      </div>
    </div>
  );
}

