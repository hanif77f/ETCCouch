/**
 * Central games registry.
 * To add a new game: create a folder in src/games/<slug>/ exposing a default
 * board component from its index.js, then add one entry here. Nothing else in
 * the app needs to change — routes, homepage grid and nav are all driven by
 * this list.
 *
 * `mode` values consumed by the game shell: "single" | "local" | "online".
 */
export const GAMES = [
  {
    slug: "chess",
    name: "Chess",
    shortDescription:
      "Play chess online free against the computer or a friend — no download, no sign-up.",
    description:
      "Play chess online free with full rules — castling, en passant and promotion included. Choose Easy, Medium or Hard to play chess vs computer online on a Stockfish-powered engine, or invite a friend for chess online with friends across two devices. No download or sign-up needed, just classic chess in your browser.",
    cover:
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
    players: "1–2 players",
    accent: "#6232AA",
    difficulties: ["Easy", "Medium", "Hard"],
    aiEngine: "Stockfish (WASM)",
    tags: ["Strategy", "Classic"],
  },
  {
    slug: "connect-4",
    name: "Connect 4",
    shortDescription:
      "Play Connect 4 online free — drop discs, connect four in a row, and block your opponent.",
    description:
      "Play Connect 4 online free against the computer or a friend. Drop your discs and connect four in a row — horizontally, vertically or diagonally — before your opponent does. Choose Easy, Medium or Hard to play Connect 4 vs computer on a Minimax-powered engine, or invite a friend for Connect 4 multiplayer. No download or sign-up needed.",
    cover:
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80",
    players: "1–2 players",
    accent: "#7C4DC4",
    difficulties: ["Easy", "Medium", "Hard"],
    aiEngine: "Minimax",
    tags: ["Strategy", "Casual"],
  },
  {
    slug: "tic-tac-toe",
    name: "Tic-Tac-Toe",
    shortDescription:
      "Play Tic Tac Toe online free — quick 2-player rounds against a perfect AI or a friend.",
    description:
      "Play Tic Tac Toe online free against the computer or a friend. The classic 3×3 game of Xs and Os — get three in a row to win. Choose Easy or Medium for a fair fight, or try Perfect difficulty, where the Minimax AI never loses. No download or sign-up needed, just quick Tic Tac Toe with friends in seconds.",
    cover:
      "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80",
    players: "1–2 players",
    accent: "#8F63D6",
    difficulties: ["Easy", "Medium", "Perfect"],
    aiEngine: "Minimax (perfect)",
    tags: ["Casual", "Classic"],
  },
  {
    slug: "battleship",
    name: "Battleship",
    shortDescription:
      "Play Battleship online free — place your fleet and sink the enemy navy first.",
    description:
      "Play Battleship online free against the computer. Position your fleet on a hidden grid, take turns firing at enemy ships, and use smart battleship strategy to sink the entire fleet first. The AI opponent uses hunt-and-target logic, so every shot counts. No download or sign-up needed, just a free browser-based Battleship game.",
    cover:
      "https://images.unsplash.com/photo-1661114544749-332ea68d1148?auto=format&fit=crop&w=1200&q=80",
    players: "1–2 players",
    accent: "#4A2286",
    difficulties: ["Easy", "Medium", "Hard"],
    aiEngine: "Hunt & Target",
    tags: ["Strategy", "Naval"],
  },
];

/** O(1) lookup by slug. */
export const GAMES_BY_SLUG = Object.fromEntries(GAMES.map((g) => [g.slug, g]));

export const getGame = (slug) => GAMES_BY_SLUG[slug] || null;
export const getGameSlugs = () => GAMES.map((g) => g.slug);

