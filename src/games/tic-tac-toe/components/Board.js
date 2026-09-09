"use client";

import Cell from "./Cell";
import { BOARD_PX, responsiveWidth } from "@/lib/boardSize";

export default function Board({ board, line, onCellClick, canPlay, size = "md" }) {
  const width = responsiveWidth(BOARD_PX["tic-tac-toe"][size] ?? BOARD_PX["tic-tac-toe"].md);
  return (
    <div className="grid grid-cols-3 gap-2.5" style={{ width }}>
      {board.map((value, i) => (
        <Cell
          key={i}
          index={i}
          value={value}
          highlight={line?.includes(i)}
          disabled={!canPlay(i)}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}

