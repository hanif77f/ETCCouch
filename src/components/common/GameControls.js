"use client";

import { Bot, Users, RotateCcw, Sparkles, UserPlus, Scaling } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { SIZE_STEPS, SIZE_META } from "@/lib/boardSize";

const MODES = [
  { id: "single", label: "Play vs Computer", short: "Computer", Icon: Bot },
  { id: "local", label: "Play with Friend", short: "Friend", Icon: Users },
];

export default function GameControls({
  mode, onModeChange, difficulties = [], difficulty, onDifficultyChange,
  onNewGame, onReset, onInvite, size, onSizeChange,
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Mode</p>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(({ id, label, short, Icon }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition focus-ring",
                mode === id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:text-fg"
              )}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          ))}
        </div>
      </div>

      {mode === "single" && difficulties.length > 0 ? (
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-ring",
                  difficulty === d
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted hover:text-fg"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {onSizeChange ? (
        <div className="space-y-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
            <Scaling size={13} /> Board size
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SIZE_STEPS.map((step) => (
              <button
                key={step}
                onClick={() => onSizeChange(step)}
                title={SIZE_META[step].title}
                aria-pressed={size === step}
                className={cn(
                  "flex items-center justify-center rounded-lg border py-2 text-sm font-semibold transition focus-ring",
                  size === step
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted hover:text-fg"
                )}
              >
                {SIZE_META[step].label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onNewGame}>
          <Sparkles size={15} /> New Game
        </Button>
        <Button size="sm" variant="secondary" onClick={onReset}>
          <RotateCcw size={15} /> Reset
        </Button>
        {mode === "local" ? (
          <Button size="sm" variant="outline" onClick={onInvite}>
            <UserPlus size={15} /> Invite Friend
          </Button>
        ) : null}
      </div>
    </div>
  );
}

