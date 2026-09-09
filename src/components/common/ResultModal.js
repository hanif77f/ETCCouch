"use client";

import { useEffect } from "react";
import { Trophy, Handshake, Swords, RotateCcw, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { getGameTheme } from "@/data/gameThemes";

/**
 * ResultModal — a celebratory end-of-game popup shown for any win / loss / draw.
 * Themed with the game's accent, animated pop-in and (on a win) confetti.
 *
 * @param {{ outcome: "win"|"lose"|"draw", title: string, message?: string }|null} result
 */

const OUTCOME = {
  win: { Icon: Trophy, label: "You won" },
  lose: { Icon: Swords, label: "Game over" },
  draw: { Icon: Handshake, label: "Draw" },
};

// Confetti palette in the brand violet family, mixed with the game's own accent.
const CONFETTI_COLORS = ["#6232AA", "#8F63D6", "#B79AF0", "#4A2286", "#D9C8F7", "#7C4DC4"];
const CONFETTI_PIECES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: ((i * 17) % 80) / 100,
  duration: 2.4 + ((i * 13) % 16) / 10,
  rotate: (i * 83) % 360,
  w: 6 + (i % 5),
  h: 10 + ((i * 3) % 8),
}));

function Confetti({ accent }) {
  const colors = [`rgb(${accent})`, ...CONFETTI_COLORS];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {CONFETTI_PIECES.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            background: colors[i % colors.length],
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ResultModal({ result, slug, onClose, onPlayAgain }) {
  const open = Boolean(result);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const { outcome, title, message } = result;
  const { Icon, label } = OUTCOME[outcome] || OUTCOME.draw;
  const { rgb } = getGameTheme(slug);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

      <div className="animate-result-pop relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
        {outcome === "win" ? <Confetti accent={rgb} /> : null}

        {/* Accent header */}
        <div
          className="relative flex flex-col items-center gap-3 px-6 pb-5 pt-8 text-center"
          style={{
            background: `radial-gradient(120% 130% at 50% -30%, rgb(${rgb} / 0.28), transparent 65%)`,
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-fg focus-ring"
          >
            <X size={18} />
          </button>

          <span
            className="animate-result-badge flex h-20 w-20 items-center justify-center rounded-full shadow-lift"
            style={{
              backgroundColor: `rgb(${rgb} / 0.16)`,
              color: `rgb(${rgb})`,
              boxShadow: `inset 0 0 0 2px rgb(${rgb} / 0.35)`,
            }}
          >
            <Icon className="h-10 w-10" strokeWidth={2} />
          </span>

          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: `rgb(${rgb})` }}
          >
            {label}
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">{title}</h2>
          {message ? <p className="text-sm leading-relaxed text-muted">{message}</p> : null}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 border-t border-border bg-surface/60 px-6 py-4">
          <Button size="sm" className="flex-1" onClick={onPlayAgain}>
            <RotateCcw size={15} /> Play again
          </Button>
          <Button size="sm" variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
