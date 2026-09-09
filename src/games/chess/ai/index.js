import { colorOf, getStatus, legalMoves, makeMove, rc } from "../engine";
import { PIECE_VALUE, WHITE } from "../constants";

/**
 * Chess AI — alpha-beta Minimax with material + piece-square evaluation.
 * Fully contained in this game folder. Difficulty maps to search depth.
 * Implements createAI(difficulty).getMove(state) -> move object.
 */

const DEPTH = { easy: 1, medium: 2, hard: 3 };

// Piece-square tables (from white's perspective, index 0 = a8/top-left).
const PST = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

const mirror = (i) => {
  const [r, c] = rc(i);
  return (7 - r) * 8 + c;
};

/** Static evaluation from WHITE's perspective (centipawns). */
function evaluate(board) {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p) continue;
    const t = p.toLowerCase();
    const val = PIECE_VALUE[t] + (PST[t] ? PST[t][colorOf(p) === WHITE ? i : mirror(i)] : 0);
    score += colorOf(p) === WHITE ? val : -val;
  }
  return score;
}

// Order moves: captures first (helps alpha-beta).
const orderMoves = (moves) => moves.slice().sort((a, b) => (b.capture ? 1 : 0) - (a.capture ? 1 : 0));

function search(state, depth, alpha, beta, maximizing) {
  const moves = legalMoves(state);
  if (moves.length === 0) {
    const { status } = getStatus(state);
    if (status === "checkmate") return maximizing ? -1e6 - depth : 1e6 + depth;
    return 0; // stalemate
  }
  if (depth === 0) return evaluate(state.board);

  if (maximizing) {
    let best = -Infinity;
    for (const m of orderMoves(moves)) {
      const val = search(makeMove(state, m), depth - 1, alpha, beta, false);
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (alpha >= beta) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of orderMoves(moves)) {
    const val = search(makeMove(state, m), depth - 1, alpha, beta, true);
    best = Math.min(best, val);
    beta = Math.min(beta, val);
    if (alpha >= beta) break;
  }
  return best;
}

export function createAI(difficulty = "Medium") {
  const depth = DEPTH[String(difficulty).toLowerCase()] ?? 2;
  return {
    getMove(state) {
      const moves = legalMoves(state);
      if (moves.length === 0) return null;
      if (String(difficulty).toLowerCase() === "easy" && Math.random() < 0.35) {
        return moves[Math.floor(Math.random() * moves.length)];
      }

      const white = state.turn === WHITE;
      let bestMove = moves[0];
      let bestVal = white ? -Infinity : Infinity;
      for (const m of orderMoves(moves)) {
        const val = search(makeMove(state, m), depth - 1, -Infinity, Infinity, !white);
        if (white ? val > bestVal : val < bestVal) {
          bestVal = val;
          bestMove = m;
        }
      }
      return bestMove;
    },
  };
}

