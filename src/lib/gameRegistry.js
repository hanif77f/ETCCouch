import dynamic from "next/dynamic";
import GameBoardSkeleton from "@/components/common/GameBoardSkeleton";

/**
 * Lazy component registry. Each game's playable board lives in its own folder
 * and is code-split via next/dynamic, so visiting one game never ships the
 * bundle for another. Register a new game by adding one line here.
 */
const LOADERS = {
  chess: () => import("@/games/chess"),
  "connect-4": () => import("@/games/connect-4"),
  "tic-tac-toe": () => import("@/games/tic-tac-toe"),
  battleship: () => import("@/games/battleship"),
};

const GAME_COMPONENTS = Object.fromEntries(
  Object.entries(LOADERS).map(([slug, loader]) => [
    slug,
    dynamic(loader, {
      ssr: false,
      loading: () => <GameBoardSkeleton />,
    }),
  ])
);

/** Stable renderer that selects an already-created lazy game component. */
export function GameBoard({ slug, ...props }) {
  const Component = GAME_COMPONENTS[slug];
  return Component ? <Component {...props} /> : null;
}

export const isRegisteredGame = (slug) => Boolean(LOADERS[slug]);
