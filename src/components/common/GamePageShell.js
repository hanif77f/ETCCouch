"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Home,
  Undo2,
  Lightbulb,
  Wrench,
  CircleHelp,
  UserPlus,
  X,
  Pause,
  Play,
  Star,
  Maximize2,
  Minimize2,
} from "lucide-react";
import GameControls from "./GameControls";
import InviteModal from "./InviteModal";
import ResultModal from "./ResultModal";
import Modal from "@/components/ui/Modal";
import { GameBoard } from "@/lib/gameRegistry";
import { getGameTheme } from "@/data/gameThemes";
import { getGameGuide } from "@/data/gameGuides";
import { createInviteLink, createRoomId } from "@/lib/multiplayer";
import { useBoardSize, SIZE_STEPS } from "@/lib/boardSize";
import { cn } from "@/utils/cn";

/** Small square icon tile used in the left/right quick-action rails (247chess style). */
function QuickButton({ Icon, label, onClick, active, href }) {
  const classes = cn(
    "ctrl-btn flex h-11 w-11 items-center justify-center rounded-lg transition focus-ring active:scale-95",
    active && "is-active"
  );
  if (href) {
    return (
      <Link href={href} title={label} aria-label={label} className={classes}>
        <Icon size={19} />
      </Link>
    );
  }
  return (
    <button onClick={onClick} title={label} aria-label={label} className={classes}>
      <Icon size={19} />
    </button>
  );
}

const formatClock = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

function GameCountdown() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCountdown(2), 1000),
      setTimeout(() => setCountdown(1), 2000),
      setTimeout(() => setCountdown("Play!"), 3000),
      setTimeout(() => setCountdown(null), 3900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (countdown === null) return null;

  return (
    <div className="animate-countdown-fade absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-md">
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
        {countdown !== "Play!" ? (
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="6" />
            <circle
              key={countdown}
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgb(168 140 235 / 0.9)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="276.46"
              className="animate-countdown-ring"
            />
          </svg>
        ) : (
          <span className="absolute inset-0 animate-ping rounded-full bg-accent-strong/30" />
        )}
        <span
          key={countdown}
          className={cn(
            "animate-countdown-pop relative font-display font-black tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]",
            countdown === "Play!" ? "text-3xl text-white sm:text-4xl" : "text-6xl text-white sm:text-7xl"
          )}
        >
          {countdown}
        </span>
      </div>
    </div>
  );
}

/**
 * GamePageShell — reusable page frame for ANY game. Owns page-level UI state
 * (mode, difficulty, session key, invite link) and mounts the game's own board
 * component from the registry. The board stays responsible for its rules, AI
 * and rendering — this shell never contains game-specific logic.
 */
export default function GamePageShell({ game }) {
  const searchParams = useSearchParams();
  const joinRoom = searchParams.get("room");

  const [mode, setMode] = useState(joinRoom ? "online" : "single");
  const [difficulty, setDifficulty] = useState(game.difficulties?.[1] || "Medium");
  const [sessionKey, setSessionKey] = useState(0);
  const [roomId, setRoomId] = useState(joinRoom || null);
  // "host" = clicked Invite; "guest" = arrived via an invite link. This decides
  // which side each player controls and how the peer connection is established.
  const [role, setRole] = useState(joinRoom ? "guest" : "host");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null); // end-of-game popup payload
  const [size, setSize] = useBoardSize("md");
  // Controls drawer: open by default on desktop, closed on phones (where it
  // overlays the board). Computed on first client render to avoid a flash.
  const [drawerOpen, setDrawerOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  // Simple match clock (247chess-style) — the human side ticks, the opponent
  // side stays static, matching the reference board screen's two clocks.
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef(null);

  // If arriving via an invite link, reflect online mode as the guest.
  // Track fullscreen state (also catches Esc, which exits fullscreen natively).
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // While fullscreen, show the board at its large preset without touching the
  // user's saved size preference (restored automatically on exit).
  const displaySize = isFullscreen ? "lg" : size;

  const newGame = () => {
    setResult(null);
    setElapsed(0);
    setPaused(false);
    setSessionKey((k) => k + 1);
  };
  const reset = () => {
    setResult(null);
    setElapsed(0);
    setPaused(false);
    setSessionKey((k) => k + 1);
  };

  const handleModeChange = (next) => {
    setMode(next);
    setResult(null);
    setElapsed(0);
    setPaused(false);
    setSessionKey((k) => k + 1);
  };

  // Tick the match clock while the game is live and not paused.
  useEffect(() => {
    if (paused || result) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [paused, result, sessionKey]);

  const invite = () => {
    const id = roomId || createRoomId();
    setRoomId(id);
    setRole("host");
    setMode("online");
    setInviteOpen(true);
    setSessionKey((k) => k + 1);
  };

  const inviteLink = roomId ? createInviteLink(game.slug, roomId) : "";
  const effectiveMode = mode === "online" ? "online" : mode;
  const boardKey = `${effectiveMode}-${difficulty}-${roomId || "solo"}-${sessionKey}`;

  // "3, 2, 1, Play!" countdown — replays every time a fresh board mounts
  // (first load, restart, mode/difficulty change, invite). Blocks the board
  // beneath it via the overlay so no move lands before "Play!".
  const theme = getGameTheme(game.slug);
  const { Icon: PieceIcon } = theme;
  const guide = getGameGuide(game.slug);

  // Player / opponent labels — mirrors the reference's "Player vs Computer"
  // clocks regardless of which game or mode is active.
  const leftLabel = mode === "single" ? "Player" : "You";
  const rightLabel = mode === "single" ? "Computer" : mode === "online" ? "Opponent" : "Friend";

  // Left rail — matches the reference's Home / Undo / Hint stack.
  const leftActions = [
    { key: "home", label: "All games", Icon: Home, href: "/games" },
    { key: "undo", label: "Restart", Icon: Undo2, onClick: reset },
    {
      key: "hint",
      label: drawerOpen ? "Hide controls" : "Tips & controls",
      Icon: Lightbulb,
      onClick: () => setDrawerOpen((o) => !o),
      active: drawerOpen,
    },
  ];

  // Right rail — Settings (cycles board size) / Help (quick how-to modal).
  const cycleSize = () => {
    const i = SIZE_STEPS.indexOf(size);
    setSize(SIZE_STEPS[(i + 1) % SIZE_STEPS.length]);
  };
  // Full controls — shared between the desktop push-drawer and mobile overlay.
  const drawerBody = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-fg">Controls</h2>
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Close controls"
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-fg focus-ring"
        >
          <X size={18} />
        </button>
      </div>

      <GameControls
        mode={mode === "online" ? "local" : mode}
        onModeChange={handleModeChange}
        difficulties={game.difficulties || []}
        difficulty={difficulty}
        onDifficultyChange={(d) => {
          setDifficulty(d);
          setResult(null);
          setSessionKey((k) => k + 1);
        }}
        onNewGame={newGame}
        onReset={reset}
        onInvite={invite}
        size={size}
        onSizeChange={setSize}
      />

      <dl className="mt-4 space-y-2.5 rounded-xl border border-border bg-surface/60 p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Players</dt>
          <dd className="font-medium text-fg">{game.players}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">AI engine</dt>
          <dd className="font-medium text-fg">{game.aiEngine}</dd>
        </div>
      </dl>
    </>
  );

  return (
    <section ref={stageRef} className="board-surface relative w-full overflow-hidden">
      {/* Quick-rail · board · right drawer — full-bleed, no side gaps */}
      <div
        className={cn(
          "relative z-10 flex w-full gap-3 py-6 pl-2 pr-0 sm:pl-3 lg:gap-4",
          isFullscreen ? "min-h-screen" : "min-h-[calc(100dvh-4rem)]"
        )}
      >
        {/* Left icon rail — Home / Restart / Tips, flush to the screen's left edge */}
        <div className="hidden shrink-0 lg:flex lg:flex-col lg:items-center lg:gap-2 lg:pt-1">
          {leftActions.map(({ key, ...a }) => (
            <QuickButton key={key} {...a} />
          ))}
        </div>

        {/* Board area */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3">
          {/* Quick-action bar — top of the board on phones (both rails combined) */}
          <div className="flex w-full flex-wrap items-center justify-center gap-2 lg:hidden">
            {leftActions.map(({ key, ...a }) => (
              <QuickButton key={key} {...a} />
            ))}
            <QuickButton Icon={Wrench} label="Board size" onClick={cycleSize} />
            <QuickButton
              Icon={isFullscreen ? Minimize2 : Maximize2}
              label={isFullscreen ? "Exit full screen" : "Full screen"}
              onClick={toggleFullscreen}
              active={isFullscreen}
            />
            <QuickButton Icon={CircleHelp} label="How to play" onClick={() => setHelpOpen(true)} />
            {mode !== "single" ? (
              <QuickButton Icon={UserPlus} label="Invite friend" onClick={invite} />
            ) : null}
          </div>

          {/* Board flanked by everything else (badges, status, pause, favorite) —
              nothing renders above or below the board itself, only beside it.
              Stacks on phones where there's no spare width beside the board. */}
          <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
            {/* Left column — Player/You badge, then pause + running clock */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <PieceIcon size={20} className="text-brandbar-fg/80" strokeWidth={2.2} />
                <span className="text-xs font-semibold text-brandbar-fg">{leftLabel}</span>
                <span className="lcd text-sm font-bold">{formatClock(elapsed)}</span>
              </div>
              <button
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume" : "Pause"}
                className="ctrl-btn flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold focus-ring active:scale-95"
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
                {formatClock(elapsed)}
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <GameBoard
                key={boardKey}
                slug={game.slug}
                mode={effectiveMode}
                difficulty={difficulty}
                roomId={roomId}
                role={role}
                size={displaySize}
                onStatusChange={setStatus}
                onResult={setResult}
              />
              <GameCountdown key={boardKey} />
            </div>

            {/* Right column — status ("White to move" etc.), Computer/Friend badge, favorite star */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              {status ? (
                <p className="lcd-plate max-w-[150px] rounded-md px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider">
                  <span className="lcd">{status}</span>
                </p>
              ) : null}
              <div className="flex flex-col items-center gap-1">
                <PieceIcon size={20} className="text-brandbar-fg/40" strokeWidth={2.2} />
                <span className="text-xs font-semibold text-brandbar-fg/70">{rightLabel}</span>
                <span className="text-sm font-bold text-brandbar-fg/60">00:00</span>
              </div>
              <button
                onClick={() => setFavorited((f) => !f)}
                aria-label={favorited ? "Unfavorite" : "Favorite"}
                className="rounded-full p-1.5 text-brandbar-fg/70 transition hover:text-accent-strong focus-ring"
              >
                <Star size={18} fill={favorited ? "currentColor" : "none"} className={favorited ? "text-accent-strong" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Right icon rail — Settings / Help (+ Invite for multiplayer) */}
        <div className="hidden shrink-0 pr-2 sm:pr-3 lg:flex lg:flex-col lg:items-center lg:gap-2 lg:pt-1">
          <QuickButton Icon={Wrench} label="Board size" onClick={cycleSize} />
          <QuickButton
            Icon={isFullscreen ? Minimize2 : Maximize2}
            label={isFullscreen ? "Exit full screen" : "Full screen"}
            onClick={toggleFullscreen}
            active={isFullscreen}
          />
          <QuickButton Icon={CircleHelp} label="How to play" onClick={() => setHelpOpen(true)} />
          {mode !== "single" ? (
            <QuickButton Icon={UserPlus} label="Invite friend" onClick={invite} />
          ) : null}
        </div>

        {/* Controls drawer — desktop push variant, flush against the screen's right edge */}
        <div
          className={cn(
            "hidden shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-out lg:block",
            drawerOpen ? "w-[320px] opacity-100" : "w-0 opacity-0"
          )}
        >
          <div className="h-full w-[320px] border-l border-border bg-card p-5">
            {drawerBody}
          </div>
        </div>
      </div>

      {/* Controls drawer — mobile overlay variant */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="animate-slide-in-right absolute inset-y-0 right-0 w-[min(88vw,340px)] overflow-y-auto border-l border-border bg-card p-5">
            {drawerBody}
          </aside>
        </div>
      ) : null}

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} link={inviteLink} />

      <ResultModal
        result={result}
        slug={game.slug}
        onClose={() => setResult(null)}
        onPlayAgain={newGame}
      />

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={`How to play ${game.name}`}>
        {guide?.howToPlay?.length ? (
          <ol className="space-y-3 text-sm leading-relaxed text-fg/90">
            {guide.howToPlay.slice(0, 4).map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">{game.description}</p>
        )}
      </Modal>
    </section>
  );
}
