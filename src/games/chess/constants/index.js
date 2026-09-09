// Board is a flat array of 64. index = row * 8 + col.
// row 0 = rank 8 (black back rank, top), row 7 = rank 1 (white back rank, bottom).
// White pieces are UPPERCASE (P N B R Q K), black are lowercase, empty = null.

export const START_BOARD = [
  "r", "n", "b", "q", "k", "b", "n", "r",
  "p", "p", "p", "p", "p", "p", "p", "p",
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  "P", "P", "P", "P", "P", "P", "P", "P",
  "R", "N", "B", "Q", "K", "B", "N", "R",
];

export const WHITE = "w";
export const BLACK = "b";

export const PIECE_VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Unicode glyphs for rendering.
export const GLYPH = {
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔",
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
};

