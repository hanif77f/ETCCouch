/**
 * GameAI — the contract every game's computer opponent implements.
 *
 * Each game keeps its AI fully inside src/games/<slug>/ai/. The shell only
 * relies on this shape, so a game can use Minimax, a WASM engine (Stockfish),
 * or heuristics without the shell knowing or caring.
 *
 * A game's ai/index.js should export:
 *   createAI(difficulty: string) => {
 *     // Given the current game state, return the chosen move (game-specific).
 *     // May be async to allow web-worker / WASM engines.
 *     getMove(state): Move | Promise<Move>
 *   }
 *
 * This file documents the convention; it intentionally has no runtime code so
 * that no shared AI logic leaks across games.
 */
export const AI_DIFFICULTIES = ["Easy", "Medium", "Hard"];

