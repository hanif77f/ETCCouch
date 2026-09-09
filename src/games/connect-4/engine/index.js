import { COLS, CONNECT, EMPTY, RED, ROWS, YELLOW } from "../constants";

/** Pure Connect 4 rules engine. Board is a flat array, index = row * COLS + col.
 *  Row 0 is the TOP; discs settle toward the bottom (higher row index). */

export const idx = (r, c) => r * COLS + c;
export const other = (p) => (p === RED ? YELLOW : RED);

export function createInitialState(startingPlayer = RED) {
  return {
    board: Array(ROWS * COLS).fill(EMPTY),
    current: startingPlayer,
    winner: null, // "R" | "Y" | "draw" | null
    winningCells: null,
  };
}

/** Columns that still have room. */
export function availableColumns(board) {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (board[idx(0, c)] === EMPTY) cols.push(c);
  return cols;
}

/** Lowest empty row in a column, or -1 if full. */
export function dropRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) if (board[idx(r, col)] === EMPTY) return r;
  return -1;
}

const DIRECTIONS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal down-right
  [1, -1], // diagonal down-left
];

/** Returns the winning cells array if `player` has CONNECT in a row through (r,c). */
function winningLineThrough(board, r, c, player) {
  for (const [dr, dc] of DIRECTIONS) {
    const cells = [[r, c]];
    // extend forward
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[idx(nr, nc)] === player) {
      cells.push([nr, nc]); nr += dr; nc += dc;
    }
    // extend backward
    nr = r - dr; nc = c - dc;
    while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[idx(nr, nc)] === player) {
      cells.unshift([nr, nc]); nr -= dr; nc -= dc;
    }
    if (cells.length >= CONNECT) return cells.map(([rr, cc]) => idx(rr, cc));
  }
  return null;
}

/** Apply a disc drop in `col`. Returns a NEW state (or same state if illegal). */
export function applyMove(state, col) {
  if (state.winner) return state;
  const r = dropRow(state.board, col);
  if (r < 0) return state;

  const board = state.board.slice();
  board[idx(r, col)] = state.current;

  const line = winningLineThrough(board, r, col, state.current);
  let winner = null;
  if (line) winner = state.current;
  else if (availableColumns(board).length === 0) winner = "draw";

  return {
    board,
    current: winner ? state.current : other(state.current),
    winner,
    winningCells: line,
  };
}

