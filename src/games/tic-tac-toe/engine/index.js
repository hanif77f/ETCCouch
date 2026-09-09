import { EMPTY, PLAYER_O, PLAYER_X, WIN_LINES } from "../constants";

/** Pure Tic-Tac-Toe rules engine. No React, no side effects. */

export function createInitialState(startingPlayer = PLAYER_X) {
  return {
    board: Array(9).fill(EMPTY),
    current: startingPlayer,
    winner: null, // "X" | "O" | "draw" | null
    line: null, // winning line triplet, for highlighting
  };
}

export const other = (p) => (p === PLAYER_X ? PLAYER_O : PLAYER_X);

export function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) if (board[i] === EMPTY) moves.push(i);
  return moves;
}

export function evaluateWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((c) => c !== EMPTY)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

/** Returns a NEW state with the move applied, or the same state if illegal. */
export function applyMove(state, index) {
  if (state.winner || state.board[index] !== EMPTY) return state;
  const board = state.board.slice();
  board[index] = state.current;
  const { winner, line } = evaluateWinner(board);
  return {
    board,
    current: winner ? state.current : other(state.current),
    winner,
    line,
  };
}

