import { availableColumns, dropRow, idx, other } from "../engine";
import { COLS, CONNECT, EMPTY, ROWS } from "../constants";

/**
 * Connect 4 AI — alpha-beta Minimax. Kept fully inside this game folder.
 * Difficulty maps to search depth. Implements createAI(difficulty).getMove(state).
 */

const DEPTH = { easy: 1, medium: 4, hard: 6 };
const CENTER = Math.floor(COLS / 2);

// Score a 4-cell window for `player`.
function scoreWindow(cells, player) {
  const opp = other(player);
  const mine = cells.filter((c) => c === player).length;
  const theirs = cells.filter((c) => c === opp).length;
  const empty = cells.filter((c) => c === EMPTY).length;
  if (mine && theirs) return 0; // mixed, dead window
  if (mine === 4) return 10000;
  if (mine === 3 && empty === 1) return 50;
  if (mine === 2 && empty === 2) return 10;
  if (theirs === 3 && empty === 1) return -80; // block priority
  if (theirs === 2 && empty === 2) return -6;
  return 0;
}

function evaluate(board, player) {
  let score = 0;
  // center control
  for (let r = 0; r < ROWS; r++) if (board[idx(r, CENTER)] === player) score += 6;

  const windows = [];
  const at = (r, c) => board[idx(r, c)];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 3 < COLS) windows.push([at(r, c), at(r, c + 1), at(r, c + 2), at(r, c + 3)]);
      if (r + 3 < ROWS) windows.push([at(r, c), at(r + 1, c), at(r + 2, c), at(r + 3, c)]);
      if (r + 3 < ROWS && c + 3 < COLS)
        windows.push([at(r, c), at(r + 1, c + 1), at(r + 2, c + 2), at(r + 3, c + 3)]);
      if (r + 3 < ROWS && c - 3 >= 0)
        windows.push([at(r, c), at(r + 1, c - 1), at(r + 2, c - 2), at(r + 3, c - 3)]);
    }
  }
  for (const w of windows) score += scoreWindow(w, player);
  return score;
}

function dropInto(board, col, player) {
  const r = dropRow(board, col);
  if (r < 0) return null;
  const next = board.slice();
  next[idx(r, col)] = player;
  return { board: next, r, col };
}

// quick 4-in-a-row check for a just-placed disc
function isWin(board, r, c, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (const s of [1, -1]) {
      let nr = r + dr * s, nc = c + dc * s;
      while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[idx(nr, nc)] === player) {
        count++; nr += dr * s; nc += dc * s;
      }
    }
    if (count >= CONNECT) return true;
  }
  return false;
}

function negamax(board, depth, alpha, beta, player, aiPlayer) {
  const cols = availableColumns(board);
  if (cols.length === 0) return { score: 0, col: null };

  // terminal / depth check via evaluation
  if (depth === 0) return { score: evaluate(board, aiPlayer), col: null };

  // order moves center-first
  cols.sort((a, b) => Math.abs(a - CENTER) - Math.abs(b - CENTER));

  let best = { score: -Infinity, col: cols[0] };
  for (const col of cols) {
    const res = dropInto(board, col, player);
    if (!res) continue;
    let score;
    if (isWin(res.board, res.r, res.col, player)) {
      score = (player === aiPlayer ? 100000 : -100000) + depth; // prefer faster wins
      // from aiPlayer's perspective in negamax we negate below, so encode absolute
      score = 100000 + depth;
    } else {
      score = -negamax(res.board, depth - 1, -beta, -alpha, other(player), aiPlayer).score;
    }
    if (score > best.score) best = { score, col };
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return best;
}

export function createAI(difficulty = "Medium") {
  const depth = DEPTH[String(difficulty).toLowerCase()] ?? 4;
  return {
    getMove(state) {
      const { board, current } = state;
      const cols = availableColumns(board);
      // 1) take an immediate win
      for (const col of cols) {
        const res = dropInto(board, col, current);
        if (res && isWin(res.board, res.r, res.col, current)) return col;
      }
      // 2) block opponent's immediate win
      const opp = other(current);
      for (const col of cols) {
        const res = dropInto(board, col, opp);
        if (res && isWin(res.board, res.r, res.col, opp)) return col;
      }
      // 3) search
      if (depth <= 1) return cols[Math.floor(Math.random() * cols.length)];
      return negamax(board, depth, -Infinity, Infinity, current, current).col ?? cols[0];
    },
  };
}

