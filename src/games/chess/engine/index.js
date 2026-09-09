import { BLACK, START_BOARD, WHITE } from "../constants";

/** Pure chess engine — full legal-move rules. No React, no side effects. */

export const rc = (i) => [i >> 3, i & 7];
export const sq = (r, c) => r * 8 + c;
export const onBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

export const colorOf = (piece) =>
  piece == null ? null : piece === piece.toUpperCase() ? WHITE : BLACK;
export const isEnemy = (piece, color) => piece != null && colorOf(piece) !== color;
export const isFriend = (piece, color) => piece != null && colorOf(piece) === color;
const opp = (color) => (color === WHITE ? BLACK : WHITE);

export function createInitialState() {
  return {
    board: START_BOARD.slice(),
    turn: WHITE,
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null, // target square index or null
    halfmove: 0,
    fullmove: 1,
  };
}

const KNIGHT = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const BISHOP = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/** Is square `target` attacked by any piece of `byColor`? */
export function isSquareAttacked(board, target, byColor) {
  const [tr, tc] = rc(target);

  // Pawns: white pawns attack upward (row-1); black downward (row+1).
  const pawnDir = byColor === WHITE ? 1 : -1; // attacker sits this many rows away toward its home
  for (const dc of [-1, 1]) {
    const pr = tr + pawnDir, pc = tc + dc;
    if (onBoard(pr, pc)) {
      const p = board[sq(pr, pc)];
      if (p && colorOf(p) === byColor && p.toLowerCase() === "p") return true;
    }
  }

  // Knights
  for (const [dr, dc] of KNIGHT) {
    const r = tr + dr, c = tc + dc;
    if (onBoard(r, c)) {
      const p = board[sq(r, c)];
      if (p && colorOf(p) === byColor && p.toLowerCase() === "n") return true;
    }
  }

  // King adjacency
  for (const [dr, dc] of KING) {
    const r = tr + dr, c = tc + dc;
    if (onBoard(r, c)) {
      const p = board[sq(r, c)];
      if (p && colorOf(p) === byColor && p.toLowerCase() === "k") return true;
    }
  }

  // Sliding: bishop/queen (diagonals), rook/queen (orthogonals)
  const scan = (dirs, types) => {
    for (const [dr, dc] of dirs) {
      let r = tr + dr, c = tc + dc;
      while (onBoard(r, c)) {
        const p = board[sq(r, c)];
        if (p) {
          if (colorOf(p) === byColor && types.includes(p.toLowerCase())) return true;
          break;
        }
        r += dr; c += dc;
      }
    }
    return false;
  };
  if (scan(BISHOP, ["b", "q"])) return true;
  if (scan(ROOK, ["r", "q"])) return true;
  return false;
}

export function findKing(board, color) {
  const king = color === WHITE ? "K" : "k";
  for (let i = 0; i < 64; i++) if (board[i] === king) return i;
  return -1;
}

export function inCheck(board, color) {
  const k = findKing(board, color);
  return k >= 0 && isSquareAttacked(board, k, opp(color));
}

const PROMO = ["q", "r", "b", "n"];

/** Pseudo-legal moves for the piece at `from` (ignores leaving own king in check). */
function pseudoMovesFrom(state, from) {
  const { board, castling, enPassant } = state;
  const piece = board[from];
  if (!piece) return [];
  const color = colorOf(piece);
  const [r, c] = rc(from);
  const type = piece.toLowerCase();
  const moves = [];
  const add = (to, extra = {}) => moves.push({ from, to, ...extra });

  if (type === "p") {
    const dir = color === WHITE ? -1 : 1; // white moves up (row decreases)
    const startRow = color === WHITE ? 6 : 1;
    const promoRow = color === WHITE ? 0 : 7;
    const one = sq(r + dir, c);
    if (onBoard(r + dir, c) && board[one] == null) {
      if (r + dir === promoRow) PROMO.forEach((p) => add(one, { promotion: p }));
      else add(one);
      const two = sq(r + 2 * dir, c);
      if (r === startRow && board[two] == null) add(two, { double: true });
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (!onBoard(nr, nc)) continue;
      const to = sq(nr, nc);
      if (isEnemy(board[to], color)) {
        if (nr === promoRow) PROMO.forEach((p) => add(to, { promotion: p, capture: true }));
        else add(to, { capture: true });
      } else if (enPassant === to) {
        add(to, { capture: true, enpassant: true });
      }
    }
    return moves;
  }

  if (type === "n") {
    for (const [dr, dc] of KNIGHT) {
      const nr = r + dr, nc = c + dc;
      if (onBoard(nr, nc) && !isFriend(board[sq(nr, nc)], color))
        add(sq(nr, nc), { capture: isEnemy(board[sq(nr, nc)], color) });
    }
    return moves;
  }

  if (type === "k") {
    for (const [dr, dc] of KING) {
      const nr = r + dr, nc = c + dc;
      if (onBoard(nr, nc) && !isFriend(board[sq(nr, nc)], color))
        add(sq(nr, nc), { capture: isEnemy(board[sq(nr, nc)], color) });
    }
    // Castling
    const backRow = color === WHITE ? 7 : 0;
    if (r === backRow && c === 4 && !inCheck(board, color)) {
      const kSide = color === WHITE ? castling.wK : castling.bK;
      const qSide = color === WHITE ? castling.wQ : castling.bQ;
      const enemy = opp(color);
      if (
        kSide &&
        board[sq(backRow, 5)] == null &&
        board[sq(backRow, 6)] == null &&
        !isSquareAttacked(board, sq(backRow, 5), enemy) &&
        !isSquareAttacked(board, sq(backRow, 6), enemy)
      ) {
        add(sq(backRow, 6), { castle: "K" });
      }
      if (
        qSide &&
        board[sq(backRow, 3)] == null &&
        board[sq(backRow, 2)] == null &&
        board[sq(backRow, 1)] == null &&
        !isSquareAttacked(board, sq(backRow, 3), enemy) &&
        !isSquareAttacked(board, sq(backRow, 2), enemy)
      ) {
        add(sq(backRow, 2), { castle: "Q" });
      }
    }
    return moves;
  }

  // Sliding pieces
  const dirs = type === "b" ? BISHOP : type === "r" ? ROOK : [...BISHOP, ...ROOK];
  for (const [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    while (onBoard(nr, nc)) {
      const to = sq(nr, nc);
      if (board[to] == null) add(to);
      else {
        if (isEnemy(board[to], color)) add(to, { capture: true });
        break;
      }
      nr += dr; nc += dc;
    }
  }
  return moves;
}

/** Apply a move, returning a NEW state. Assumes the move is legal. */
export function makeMove(state, move) {
  const board = state.board.slice();
  const castling = { ...state.castling };
  const piece = board[move.from];
  const color = colorOf(piece);
  const [fr, fc] = rc(move.from);
  const [tr, tc] = rc(move.to);

  // En passant capture: remove the pawn behind the target.
  if (move.enpassant) {
    board[sq(fr, tc)] = null;
  }

  // Move the piece.
  board[move.to] = move.promotion
    ? color === WHITE
      ? move.promotion.toUpperCase()
      : move.promotion
    : piece;
  board[move.from] = null;

  // Castling: move the rook too.
  if (move.castle === "K") {
    const backRow = color === WHITE ? 7 : 0;
    board[sq(backRow, 5)] = board[sq(backRow, 7)];
    board[sq(backRow, 7)] = null;
  } else if (move.castle === "Q") {
    const backRow = color === WHITE ? 7 : 0;
    board[sq(backRow, 3)] = board[sq(backRow, 0)];
    board[sq(backRow, 0)] = null;
  }

  // Update castling rights.
  if (piece === "K") { castling.wK = false; castling.wQ = false; }
  if (piece === "k") { castling.bK = false; castling.bQ = false; }
  if (move.from === sq(7, 0) || move.to === sq(7, 0)) castling.wQ = false;
  if (move.from === sq(7, 7) || move.to === sq(7, 7)) castling.wK = false;
  if (move.from === sq(0, 0) || move.to === sq(0, 0)) castling.bQ = false;
  if (move.from === sq(0, 7) || move.to === sq(0, 7)) castling.bK = false;

  // En passant target for next move.
  let enPassant = null;
  if (move.double) enPassant = sq((fr + tr) / 2, fc);

  const isCaptureOrPawn = move.capture || piece.toLowerCase() === "p";

  return {
    board,
    turn: opp(color),
    castling,
    enPassant,
    halfmove: isCaptureOrPawn ? 0 : state.halfmove + 1,
    fullmove: color === BLACK ? state.fullmove + 1 : state.fullmove,
  };
}

/** All fully-legal moves for the side to move (or for a single `from`). */
export function legalMoves(state, from = null) {
  const { board, turn } = state;
  const froms = from != null ? [from] : [];
  if (from == null) {
    for (let i = 0; i < 64; i++) if (isFriend(board[i], turn)) froms.push(i);
  } else if (!isFriend(board[from], turn)) {
    return [];
  }

  const legal = [];
  for (const f of froms) {
    for (const m of pseudoMovesFrom(state, f)) {
      const next = makeMove(state, m);
      if (!inCheck(next.board, turn)) legal.push(m);
    }
  }
  return legal;
}

/** Game status after arriving at `state` (whose turn it is now). */
export function getStatus(state) {
  const moves = legalMoves(state);
  const checked = inCheck(state.board, state.turn);
  if (moves.length === 0) {
    if (checked) return { status: "checkmate", winner: opp(state.turn) };
    return { status: "stalemate", winner: "draw" };
  }
  if (state.halfmove >= 100) return { status: "draw", winner: "draw" };
  return { status: checked ? "check" : "playing", winner: null };
}

