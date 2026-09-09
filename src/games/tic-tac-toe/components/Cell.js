"use client";

import { X, Circle } from "lucide-react";
import { PLAYER_X } from "../constants";
import { cn } from "@/utils/cn";

export default function Cell({ value, index, onClick, disabled, highlight }) {
  return (
    <button
      onClick={() => onClick(index)}
      disabled={disabled || Boolean(value)}
      aria-label={`Cell ${index + 1}${value ? `, ${value}` : ""}`}
      className={cn(
        "flex aspect-square items-center justify-center rounded-xl border transition-all duration-200 focus-ring",
        "border-border bg-surface",
        !value && !disabled && "hover:border-accent/50 hover:bg-card",
        highlight && "border-accent bg-accent/15"
      )}
    >
      {value === PLAYER_X ? (
        <X strokeWidth={2.5} className="h-[45%] w-[45%] text-accent" />
      ) : value ? (
        <Circle strokeWidth={2.5} className="h-[42%] w-[42%] text-pine" />
      ) : null}
    </button>
  );
}

