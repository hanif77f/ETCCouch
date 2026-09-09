import { applyMove, availableMoves, evaluateWinner, other } from "../engine";

/**
 * Tic-Tac-Toe AI. Kept entirely inside this game folder per architecture rules.
 * - Easy: random legal move.
 * - Medium: 55% perfect, else random (beatable).
 * - Perfect/Hard: full Minimax — never loses.
 *
 * Implements the GameAI contract: createAI(difficulty).getMove(state) -> index.
 */
function minimax(board, player, aiPlayer, depth) {
  const { winner } = evaluateWinner(board);
  if (winner === aiPlayer) return { score: 10 - depth };
  if (winner === other(aiPlayer)) return { score: depth - 10 };
  if (winner === "draw") return { score: 0 };

  const moves = availableMoves(board);
  let best =
    player === aiPlayer
      ? { score: -Infinity, index: moves[0] }
      : { score: Infinity, index: moves[0] };

  for (const index of moves) {
    const next = board.slice();
    next[index] = player;
    const { score } = minimax(next, other(player), aiPlayer, depth + 1);
    if (player === aiPlayer) {
      if (score > best.score) best = { score, index };
    } else if (score < best.score) {
      best = { score, index };
    }
  }
  return best;
}

const randomMove = (board) => {
  const moves = availableMoves(board);
  return moves[Math.floor(Math.random() * moves.length)];
};

export function createAI(difficulty = "Perfect") {
  const level = String(difficulty).toLowerCase();
  return {
    getMove(state) {
      const { board, current } = state;
      if (level === "easy") return randomMove(board);
      if (level === "medium") {
        return Math.random() < 0.55
          ? minimax(board, current, current, 0).index
          : randomMove(board);
      }
      return minimax(board, current, current, 0).index; // hard / perfect
    },
  };
}

