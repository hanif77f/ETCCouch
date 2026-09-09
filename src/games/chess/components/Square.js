"use client";

import { colorOf, rc } from "../engine";
import { WHITE } from "../constants";
import { cn } from "@/utils/cn";

// Filled glyphs for BOTH colors (colored via CSS) for a uniform, premium look.
const FILLED = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Square({ index, piece, light, selected, isTarget, isLastMove, onClick }) {
  const [r, c] = rc(index);
  const white = piece ? colorOf(piece) === WHITE : false;

  return (
    <button
      onClick={() => onClick(index)}
      aria-label={`Square ${FILES[c]}${8 - r}`}
      className="relative flex aspect-square w-[var(--cell)] items-center justify-center"
      style={{ backgroundColor: light ? "rgb(var(--sq-light))" : "rgb(var(--sq-dark))" }}
    >
      {/* last-move tint */}
      {isLastMove ? (
        <span className="pointer-events-none absolute inset-0 bg-accent/25" />
      ) : null}
      {/* selection ring */}
      {selected ? (
        <span className="pointer-events-none absolute inset-0 ring-[3px] ring-inset ring-accent" />
      ) : null}

      {/* coordinates (a-h on bottom rank, 1-8 on left file) */}
      {c === 0 ? (
        <span
          className="pointer-events-none absolute left-[3px] top-[2px] text-[9px] font-semibold sm:text-[10px]"
          style={{ color: light ? "rgb(var(--sq-dark))" : "rgb(var(--sq-light))", opacity: 0.75 }}
        >
          {8 - r}
        </span>
      ) : null}
      {r === 7 ? (
        <span
          className="pointer-events-none absolute bottom-[1px] right-[3px] text-[9px] font-semibold sm:text-[10px]"
          style={{ color: light ? "rgb(var(--sq-dark))" : "rgb(var(--sq-light))", opacity: 0.75 }}
        >
          {FILES[c]}
        </span>
      ) : null}

      {piece ? (
        <span
          className="relative z-10 select-none leading-none"
          style={{
            fontSize: "calc(var(--cell) * 0.72)",
            color: white ? "#f7f3ec" : "#241d16",
            WebkitTextStroke: white
              ? "1.2px rgba(28,20,12,0.6)"
              : "1px rgba(247,243,236,0.3)",
            filter: "drop-shadow(0 2px 1.5px rgba(20,14,8,0.35))",
          }}
        >
          {FILLED[piece.toLowerCase()]}
        </span>
      ) : null}

      {isTarget ? (
        <span
          className={cn(
            "pointer-events-none absolute rounded-full",
            piece ? "inset-1 border-[3px] border-accent/80" : "h-3.5 w-3.5 bg-accent/70"
          )}
        />
      ) : null}
    </button>
  );
}

