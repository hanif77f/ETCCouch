import Link from "next/link";
import {
  Bot,
  Users,
  Scaling,
  Smartphone,
  Trophy,
  MoonStar,
  Lightbulb,
  ChevronDown,
  ArrowRight,
  Play,
  Crown,
  MousePointerClick,
  Compass,
  Swords,
  Sparkles,
  ShieldAlert,
  Handshake,
  Target,
  Repeat,
  ArrowDownToLine,
  Ship,
  Shuffle,
  Crosshair,
  Zap,
  Anchor,
  ListChecks,
  CircleHelp,
} from "lucide-react";
import GameCard from "./GameCard";
import { GAMES } from "@/data/playGames";
import { getGameGuide } from "@/data/gameGuides";
import { getGameTheme } from "@/data/gameThemes";

/**
 * One icon per "How to play" step, in the same order as each game's
 * `howToPlay` array in gameGuides.js — purely presentational, so it lives
 * here rather than in the data file. Falls back to CircleHelp if a game
 * gains a step without a matching icon.
 */
const HOW_TO_PLAY_ICONS = {
  chess: [Crown, MousePointerClick, Compass, Swords, Sparkles, ShieldAlert, Handshake, Users],
  "connect-4": [Target, Repeat, ArrowDownToLine, Trophy, ShieldAlert, Handshake, Users],
  "tic-tac-toe": [Target, Repeat, MousePointerClick, Trophy, Handshake, Users],
  battleship: [Ship, Shuffle, Crosshair, Zap, Anchor, ListChecks, Bot, Trophy],
};

/**
 * The stack of supporting sections shown below the play stage: how to play,
 * feature highlights, strategy tips, FAQs and links to other games. All content
 * is per-game and data-driven, so adding a game needs no changes here.
 */
export default function GameInfoSections({ game }) {
  const guide = getGameGuide(game.slug);
  const { rgb } = getGameTheme(game.slug);
  const tint = `rgb(${rgb})`;
  const others = GAMES.filter((g) => g.slug !== game.slug);
  const stepIcons = HOW_TO_PLAY_ICONS[game.slug] || [];

  const features = [
    {
      Icon: Bot,
      title: "Play vs Computer",
      desc: `Face the ${game.aiEngine} engine across ${(game.difficulties || []).length} difficulty levels.`,
    },
    guide?.online && {
      Icon: Users,
      title: "Play with a Friend",
      desc: "Share an invite link and play live across two devices.",
    },
    {
      Icon: Scaling,
      title: "Resizable board",
      desc: "Switch between Small, Medium and Large to suit your screen.",
    },
    {
      Icon: Smartphone,
      title: "Fits every screen",
      desc: "The full board stays visible on phone, tablet and desktop.",
    },
    {
      Icon: Trophy,
      title: "Win celebrations",
      desc: "A confetti-filled popup crowns every victory.",
    },
    {
      Icon: MoonStar,
      title: "Light & dark",
      desc: "A warm theme that follows your system preference.",
    },
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      {/* How to play */}
      {guide?.howToPlay?.length ? (
        <section>
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            How to play {game.name}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {guide.howToPlay.map((step, i) => {
              const Icon = stepIcons[i] || CircleHelp;
              return (
                <li
                  key={i}
                  className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card"
                >
                  <span
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `rgb(${rgb} / 0.14)`, color: tint }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    <span
                      className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-soft"
                      style={{ backgroundColor: tint }}
                    >
                      {i + 1}
                    </span>
                  </span>
                  <p className="self-center text-sm leading-relaxed text-fg/90">{step}</p>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {/* Features */}
      <section>
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Everything packed in
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <span
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `rgb(${rgb} / 0.14)`, color: tint }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="font-semibold text-fg">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips & strategy */}
      {guide?.tips?.length ? (
        <section>
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            <Lightbulb className="h-6 w-6" style={{ color: tint }} /> Tips &amp; strategy
          </h2>
          <ul className="space-y-3">
            {guide.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-soft"
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: tint }}
                />
                <p className="text-sm leading-relaxed text-fg/90">{tip}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* FAQ */}
      {guide?.faqs?.length ? (
        <section>
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {guide.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card p-5 shadow-soft [&::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg marker:content-none">
                  {faq.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* More games — temporarily hidden across all games, re-enable by
          restoring the `others.length` check below. */}
      {false && others.length ? (
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              More games to play
            </h2>
            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-accent transition-all hover:gap-2.5 focus-ring"
            >
              All games <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Bottom call to action */}
      <section className="overflow-hidden rounded-2xl border border-border p-8 text-center shadow-card sm:p-10"
        style={{ background: `radial-gradient(120% 140% at 50% -20%, rgb(${rgb} / 0.16), transparent 60%), rgb(var(--card))` }}
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Ready for another round?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Scroll back up to the board, pick your mode and difficulty, and jump straight into {game.name}.
        </p>
        <Link
          href="/games"
          className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-[0.98]"
          style={{ backgroundColor: tint }}
        >
          <Play size={15} /> Explore all games
        </Link>
      </section>
    </div>
  );
}

